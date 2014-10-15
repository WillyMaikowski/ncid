// The application base URL.
var BaseURL = '/news/';
var MediaBaseURL = '/media/';
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

// The event object class.
function ContentEvent() {
    this.id = null;
    this.author = 'unknown';
    this.title = 'Titulo de evento';
    this.lecturer = 'El Charlista';
    this.date = 'Fecha de evento';
    this.start_time = 'Hora de comienzo';
    this.end_time = 'Hora de termino';
    this.published = false;

    this.contentType = function() {
        return 'Evento';
    }

    // This method gives the REST url of the slide
    this.url = function() {
        return BaseURL + "event/" + this.id + "/";
    }
    this.editUrl = function() {
        return this.url() + 'edit';
    }

    // Reads the event data from the json.
    this.readData = function(data) {
        var fields = data.fields;
        this.id = data.pk;
        this.author = fields.author;
        this.title = fields.title;
        this.lecturer = fields.lecturer;
        this.date = localFormatDate(new Date(fields.date));
        this.start_time = fields.start_time;
        this.end_time = fields.end_time;
    }

    // Circulation start.
    this.circulationStart = function() {
        return this.date + " " + this.start_time;
    }

    // Circulation end
    this.circulationEnd = function() {
        return this.date + " " + this.end_time;
    }
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
            this.image.attr("src", MediaBaseURL + this.model.image);
        else
            this.image.attr("src", BlankImage);
    };

    // Put the data back in the model
    this.updateModel = function () {
        this.model.title = this.title.html();       
        this.model.text = this.text.html();
    };

    // Change the slide class.
    this.changeCssClass = function(cssClass) {
        this.mainElement.attr("class", cssClass);
    };
}

// The content slide class.
function ContentSlide() {
    this.id = null;
    this.author = 'unknown';
    this.title = "Titulo";
    this.text = "Contenido";
    this.image = null;
    this.start_date = localFormatDate(new Date(Date.now()));
    this.start_time = "00:00";
    this.end_date = localFormatDate(new Date(Date.now()));
    this.end_time = "23:59";
    this.published = false;
    this.display_duration = 15.0;
    this.template = null;
    this.draft = false;

    this.view = new ContentSlideView(this);

    this.contentType = function() {
        return 'Contenido';
    }

    // This method gives the REST url of the slide
    this.url = function() {
        return BaseURL + "content/" + this.id + "/";
    }
    this.editUrl = function() {
        return this.url() + 'edit';
    }

    this.readData = function(data) {
        var fields = data.fields;
        this.id = data.pk;

        this.author = fields.author;
        this.title = fields.title;
        this.text = fields.content;
        this.image = fields.image;

        var startDateTime = new Date(fields.circulation_start);
        this.start_date = localFormatDate(startDateTime);
        this.start_time = formatTime(startDateTime);

        var endDateTime = new Date(fields.circulation_end);
        this.end_date = localFormatDate(endDateTime);
        this.end_time = formatTime(endDateTime);

        this.display_duration = fields.display_duration;
        this.published = fields.published;
        this.draft = fields.draft;
        this.template = SlideTemplates.all[fields.template-1];

        if(this.image.length == 0)
            this.image = null;
    }

    // This method encodes the slide into a simpler object for posting.
    this.encodeForPost = function() {
        return {
            title: this.title,
            text: this.text,
            image: this.image,
            start_date: this.start_date,
            start_time: this.start_time,
            end_date: this.end_date,
            end_time: this.end_time,
            published: this.published,
            draft: this.draft,
            display_duration: this.display_duration,
            template: this.template.id,
        }
    }

    // Renders the element into a container object.
    this.renderTo = function(container) {
        this.view.update();
        container.append(this.view.mainElement);
    }

    // Circulation start.
    this.circulationStart = function() {
        return this.start_date + " " + this.start_time;
    }

    // Circulation end
    this.circulationEnd = function() {
        return this.end_date + " " + this.end_time;
    }
}

function readContentArray(contents) {
    var ModelMap = {
        'news.event': ContentEvent,
        'news.slide': ContentSlide
    };

    return contents.map(function(content) {
        var obj = new ModelMap[content.model] ();
        obj.readData(content);
        return obj;
    });
}
