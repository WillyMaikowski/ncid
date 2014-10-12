// The application base URL.
var BaseURL = '/news/';
var TemplatesURL = BaseURL + 'slide-templates/all'

// Singleton object
var SlideTemplates = new function() {
    var self = this;
    var loaded = false;
    var loadedHandler = function() {};

    // The Slide template class
    function Template(data)
    {
        this.id = data.pk;
        this.name = data.fields.name;
        this.css_class = data.fields.css_class;
    }

    // Method for registering a handler for loading the data.
    this.load = function(handler) {
        if(loaded) {
            handler();
        }
        else {
            // Add a new handler to the loaded list.
            var oldHandlers = loadedHandler;
            loadedHandler = function() {
                oldHandlers();
                handler();
            }
        }
    }

    // Try to load all the templates as soon as possible.
    $.getJSON(TemplatesURL, function(data) {
        // Read the template date.
        self.all = data.map(function(element) { return new Template(element); });

        // Set the loaded flag and invoke the handlers.
        loaded = true;
        loadedHandler();
    });
}

// The content slide view class
function ContentSlideView() {
    var self = this;

    // Instantiate the slide DOM elements
    this.title = $('<div class="slideTitle"></div>"');
    this.text = $('<div class="slideText"></div>"');
    this.image = $('<div class="slideImage"></div>"');
    this.mainElement = $('<div class="slide"></div>"');

    this.mainElement.append(this.title).append(this.text).append(this.image);

    // Updates the slide
    this.update = function(content) {
        this.title.html(content.title);
        this.text.html(content.text);
    }

    // Change the slide class.
    this.changeCssClass = function(cssClass) {
        mainElement.attr("class", cssClass);
    }
}

// The content slide class.
function ContentSlide() {
    this.template = null;
    this.title = "Ingrese el titulo";
    this.text = "Agregue aqui el contenido";
    this.image = null;

    this.view = new ContentSlideView();

    this.renderTo = function(container) {
        this.view.update(this);
        container.append(this.view.mainElement);
    }
}

