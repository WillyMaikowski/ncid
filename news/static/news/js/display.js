var BaseURL = '/news/';
var CurrentContentURL = BaseURL + 'content/currents';
var CurrentEventURL = BaseURL + 'event/currents';
var RefreshInterval = 3000;

// The news display class.
function NewsDisplay() {
    this.firstContentRender = true;
    this.contents = [];
    this.eventURL = CurrentEventURL;
    this.contentURL = CurrentContentURL;
    this.previewingDrafts = false;

    // Starts the news display
    this.start = function() {
        this.startPreviewFor(CurrentEventURL, CurrentContentURL);
    }

    // Starts the new preview for content.
    this.startPreviewFor = function(eventURL, contentURL) {
        var self = this;
        self.eventURL = eventURL;
        self.contentURL = contentURL;
        SlideTemplates.load(function() {
            self.refresh();
            window.setInterval(function(){self.refresh()}, RefreshInterval)
        });
    }

    // Refreshes the new display.
    this.refresh = function() {
        this.refreshEvent();
        this.refreshContent();
    }

    // Refreshes the events.
    this.refreshEvent = function() {
        // Check if displaying the event.
        if(this.eventURL == null)
            return;

        var self = this;
        $.getJSON(this.eventURL, function(data) {
            self.loadEvents(data);
        });
    }

    // Refreshes the content.
    this.refreshContent = function() {
        // Check if displaying the content.
        if(this.contentURL == null)
            return;

        var self = this;
        $.getJSON(this.contentURL, function(data) {
            self.loadContent(data);
        });

    }

    // Loads the event data.
    this.loadEvents = function(data) {
        // Read the events data.
        var events = readContentArray(data);

        // Clear the old content.
        var eventPanel = $("#events-panel");
        eventPanel.empty();

        if( events.length == 0 ) {
            $( '#contents-section' ).removeClass( 'col-xs-9' ).addClass( 'col-xs-12' );
            $( '#events-section' ).removeClass( 'col-xs-3' ).addClass( 'hidden' );
        }
        else {
            $( '#contents-section' ).removeClass( 'col-xs-12' ).addClass( 'col-xs-9' );
            $( '#events-section' ).removeClass( 'hidden' ).addClass( 'col-xs-3' );
            // Create the event elements
            for(var i = 0; i < events.length; ++i) {
                var event = events[i];
                var display = event.renderDisplay();
                eventPanel.append(display);
            }
        }
    }

    // Loads the content data.
    this.loadContent = function(data) {
        var self = this;
        readContentArray(data, function(contents) {
            self.loadedContent(contents);
        });
    }

    this.loadedContent = function(contents) {
        // Use the draft version if we are previewing.
        if(this.previewingDrafts) {
            for(var i = 0; i < contents.length; ++i)
                contents[i].useDraft();
        }

        if(!this.hasContentChanges(contents))
            return;
        this.contents = contents;

        // Clean the carousel data.
        var indicators = $('#slides-indicator');
        var slidesHolder = $('#slides-holder');
        indicators.empty();
        slidesHolder.empty()

        // RenderNoContent
        if(contents.length == 0) {
            this.renderNoContent();
        }
        else {
            // Create the content elements
            for(var i = 0; i < contents.length; ++i) {
                var content = contents[i];
                var indicator = content.renderIndicator(i);
                indicators.append(indicator);
                if(i == 0)
                    indicator.addClass('active')

                var data = content.renderContent();
                if(i == 0)
                    data.addClass('active')
                slidesHolder.append(data);
            }
        }

        // Enable the carousel in the first content render.
        this.enableCarousel();
    }

    // Enables the carousel.
    // Taken from http://stackoverflow.com/questions/14236516/twitter-bootstrap-carousel-slide-duration
    this.enableCarousel = function() {
        if(!this.firstContentRender)
            return;
        this.firstContentRender = false;

        var start = 1000;
        var interval = 1000;
        var carousel = $('#carousel');
        var carouselItems = $('#slides-holder');

        t = window.setTimeout(function() {
            carousel.carousel({
                interval: interval,
            });
        }, start - interval);

        carousel.on('slid.bs.carousel', function () {   
             clearTimeout(t);  
             var duration = carouselItems.find('.active').attr('data-interval');

             carousel.carousel('pause');
             t = setTimeout(function() {
                carousel.carousel();
             }, duration - interval);
        })

        $('.carousel-control.right').on('click', function(){
            clearTimeout(t);   
        });

        $('.carousel-control.left').on('click', function(){
            clearTimeout(t);   
        });

    }

    // Render no content
    this.renderNoContent = function() {
        $('#slides-indicator')
            .append($('<li class="active" data-target="#carousel" data-slide-to="0"></li>'));
        $('#slides-holder')
            .append($('<div class="item active"><div class="parent"><div class="cell text-center">No hay contenido disponible.</div></div></div>'));
    }

    // Check for content changes.
    this.hasContentChanges = function(newContents) {
        if(this.contents.length != newContents.length)
            return true;

        for(var i = 0; i < this.contents.length; ++i) {
            if(!this.contents[i].equals(newContents[i]))
                return true;
        }
        return false;
    }
}

// Use the news display.
var newsDisplay = new NewsDisplay()

