var BaseURL = '/news/';
var CurrentContentURL = BaseURL + 'content/currents';
var CurrentEventURL = BaseURL + 'event/currents';
var RefreshInterval = 15000;

// The news display class.
function NewsDisplay() {
    this.firstContentRender = true;
    this.contents = [];

    // Starts the news display
    this.start = function() {
        var self = this;
        SlideTemplates.load(function() {
            self.refresh();
            window.setInterval(function(){self.refresh}, RefreshInterval)
        });
    }

    // Refreshes the new display.
    this.refresh = function() {
        this.refreshEvent();
        this.refreshContent();
    }

    // Refreshes the events.
    this.refreshEvent = function() {
        var self = this;
        $.getJSON(CurrentEventURL, function(data) {
            self.loadEvents(data);
        });
    }

    // Refreshes the content.
    this.refreshContent = function() {
        var self = this;
        $.getJSON(CurrentContentURL, function(data) {
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

        // Create the event elements
        for(var i = 0; i < events.length; ++i) {
            var event = events[i];
            var display = event.renderDisplay();
            eventPanel.append(display);
        }
    }

    // Loads the content data.
    this.loadContent = function(data) {
        var contents = readContentArray(data);
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
        var carousel = $('#carousel');
        if(this.firstContentRender) {
            carousel.carousel();
            this.firstContentRender = false;
        }

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
            if(!this.contents.equals(newContents[i]))
                return true;
        }
        return false;
    }
}

// Use the news display.
var newsDisplay = new NewsDisplay()
$(window).load(function() {
    newsDisplay.start();
})
