// The application base URL.
var BaseURL = '/news/';
var TemplatesURL = BaseURL + 'slide-templates/all';
var BlankImage = BaseURL + 'style/images/missing-image.png';

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
        this.image_url = data.fields.image_url;
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
function ContentSlideView(model) {
    var self = this;
    this.model = model;

    // Instantiate the slide DOM elements
    this.title = $('<div class="slideTitle"></div>"');
    this.text = $('<div class="slideText"></div>"');
    this.image = $('<img class="slideImage"></img>"');
    this.mainElement = $('<div></div>"');

    this.mainElement.append(this.title).append(this.text).append(this.image);

    // Updates the slide
    this.update = function() {
        this.title.html(this.model.title);
        this.text.html(this.model.text);
        if(model.image != null)
            this.image.attr("src", this.model.image);
        else
            this.image.attr("src", BlankImage);
    };

    // Put the data back in the model
    this.updateModel = function () {
        this.model.title = title.html();       
        this.model.text = text.html();

        var image = this.image.attr("src");
        if(image != BlankImage)
            this.model.image = image;
        else
            this.model.image = null;
    };

    // Change the slide class.
    this.changeCssClass = function(cssClass) {
        this.mainElement.attr("class", cssClass);
    };
}

// The content slide class.
function ContentSlide() {
    this.title = "Titulo";
    this.text = "Contenido";
    this.image = null;
    this.start_date = new Date(Date.now());
    this.end_date = new Date(Date.now());
    this.published = false;
    this.display_duration = 15.0;
    this.template = null;

    this.view = new ContentSlideView(this);

    // Renders the element into a container object.
    this.renderTo = function(container) {
        this.view.update();
        container.append(this.view.mainElement);
    }
}

