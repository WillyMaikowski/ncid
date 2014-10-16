// The application base URL.
var BaseURL = '/news/';
var MediaBaseURL = '/media/';
var TemplatesURL = BaseURL + 'slide-templates/all';
var BlankImage = BaseURL + 'style/images/missing-image.png';

// Helper functions for converting the dates.
function numberFormatForTime(number) {
    if(number < 10)
        return '0' + number;
    return number;
}

function formatTime(datetime) {
    return numberFormatForTime(datetime.getHours()) + ':' + numberFormatForTime(datetime.getMinutes());
}

// Formats a date for the current localization.
function localFormatDate(date) {
    // Hack: Use something more proper
    return numberFormatForTime(date.getDate()) + '/' + numberFormatForTime(date.getMonth() + 1) + '/' + numberFormatForTime(date.getFullYear());
}

function localFormatDateTime(datetime) {
    return localFormatDate(datetime) + " " + formatTime(datetime);
}

// Singleton object
var SlideTemplates = new function() {
    var self = this;
    var loaded = false;
    var loadedHandler = function() {};

    // The Slide template class
    function Template(data)
    {
        var fields = data.fields;
        this.id = data.pk;
        this.name = fields.name;
        this.image_url = fields.image_url;
        this.has_text = fields.has_text;
        this.has_title = fields.has_title;
        this.has_image = fields.has_image;

        this.slide_class = fields.slide_class;
        this.title_class = fields.title_class;
        this.text_class = fields.text_class;
        this.image_class = fields.image_class;
        this.container_class = fields.container_class;
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
    this.place = 'Lugar';
    this.start_time = 'Hora de comienzo';
    this.end_time = 'Hora de termino';
    this.circulation_start = new Date(Date.now());
    this.circulation_end = new Date(Date.now())
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
        this.place = fields.place;
        this.start_time = fields.start_time;
        this.end_time = fields.end_time;
        this.circulation_start = new Date(fields.circulation_start);
        this.circulation_end = new Date(fields.circulation_end);
        this.published = fields.published;
    }

    // Circulation start.
    this.circulationStart = function() {
        return localFormatDateTime(this.circulation_start);
    }

    // Circulation end
    this.circulationEnd = function() {
        return localFormatDateTime(this.circulation_end);
    }

    // Render display
    // This method constructs the element that is going to be inserted into the display.
    this.renderDisplay = function() {
        return $('<div class="row" />')
                .append( $('<div class="col-xs-12" />')
                    .append( $('<div class="evento" />')
                        .append( $('<div class="content" style="text-align:justify;text-justify:inter-word;" />')
                                .html(this.eventText())
                        )
                    )
                );
    }

    // It creates the event text.
    this.eventText = function() {
        // Do this more properly.
        return this.date + ' ' + this.start_time + ' - ' + this.end_time + ' ' + this.title + ". <i>" + this.lecturer + ". </i> " + this.place;
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

    this.textImageContainer = $('<div class="slideContent" />').append(this.text).append(this.image);
    this.mainElement = $('<div />');
    this.mainElement.append(this.title).append(this.textImageContainer);

    // Updates the slide
    this.update = function(edition) {
        this.title.html(this.model.title);
        this.text.html(this.model.text);
        if(model.image != null)
            this.image.attr("src", MediaBaseURL + this.model.image);
        else
            this.image.attr("src", BlankImage);

        if(this.model.template) {
            if(edition && !this.model.template.has_title)
                this.title.attr("class", 'edition-title');
            else
                this.title.attr("class", this.model.template.title_class);
            this.text.attr("class", this.model.template.text_class);
            this.image.attr("class", this.model.template.image_class);

            this.textImageContainer.attr("class", this.model.template.container_class);
            this.mainElement.attr("class", this.model.template.slide_class);
        }
    };

    // Put the data back in the model
    this.updateModel = function () {
        this.model.title = this.title.html();       
        this.model.text = this.text.html();
    };

}

// The content slide class.
function ContentSlide() {
    this.id = null;
    this.author = 'unknown';
    this.title = "Titulo";
    this.text = "Contenido";
    this.image = null;
    this.circulation_start = new Date(Date.now())
    this.circulation_end = new Date(Date.now())
    this.published = false;
    this.display_duration = 15.0;
    this.template = null;
    this.draft = false;

    this.view = new ContentSlideView(this);

    this.contentType = function() {
        return 'Contenido';
    }

    // Tells if this content is equal to another one.
    this.equals = function(o) {
        return this.id == o.id && this.author == o.author &&
                this.title == o.title && this.text == o.text &&
                this.image == o.image && this.display_duration == o.display_duration &&
                this.template == o.template;
    }

    // This method gives the REST url of the slide
    this.url = function() {
        return BaseURL + "content/" + this.id + "/";
    }
    this.editUrl = function() {
        return this.url() + 'edit';
    }
    this.previewUrl = function() {
        return this.url() + 'preview';
    }

    this.readData = function(data) {
        var fields = data.fields;
        this.id = data.pk;

        this.author = fields.author;
        this.title = fields.title;
        this.text = fields.content;
        this.image = fields.image;

        this.circulation_start = moment(fields.circulation_start).toDate();
        this.circulation_end = moment(fields.circulation_end).toDate();

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
            circulation_start: this.circulation_start,
            circulation_end: this.circulation_end,
            published: this.published,
            draft: this.draft,
            display_duration: this.display_duration,
            template: this.template.id,
        }
    }

    // Renders the element into a container object.
    this.renderTo = function(container, edition) {
        this.view.update(edition);
        container.append(this.view.mainElement);
    }

    // Circulation start.
    this.circulationStart = function() {
        return localFormatDateTime(this.circulation_start);
    }

    // Circulation end
    this.circulationEnd = function() {
        return localFormatDateTime(this.circulation_end);
    }

    // Renders the slide indicator.
    this.renderIndicator = function(index) {
        return $('<li data-target="#carousel" class=""></li>').attr('data-slide-to', index)
    }

    // Renders the slide content
    this.renderContent = function() {
        this.view.update();
        return $('<div class="item" />')
                .append( $('<div class="parent" />')
                    .append( $('<div class="cell text-center" />')
                        .append(this.view.mainElement)
                    )
                )
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


