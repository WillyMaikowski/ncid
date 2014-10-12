// The application base URL.
var BaseURL = '/news/';
var IndexURL = BaseURL;
var AddContentURL = BaseURL + 'content/add';

// The content editor.
function ContentEditor() {
    this.isNewContent = false;
    this.isFirstTemplateBeingSelected = false;
    this.contentSlide = null;

    // Rich text editor commands
    this.bold = function() {
        document.execCommand("bold", false, null);
    }
    this.italic = function() {
        document.execCommand("italic", false, null);
    }
    this.underline = function() {
        document.execCommand("underline", false, null);
    }
    this.undo = function() {
        document.execCommand("undo", false, null);
    }
    this.redo = function() {
        document.execCommand("redo", false, null);
    }

    this.changeSlide = function() {
        var slideContainer = $('#slideContainer');
        slideContainer.empty();

        this.contentSlide.renderTo(slideContainer);
        this.loadMetadata();
        this.makeEditable();
    }

    this.loadContent = function(id) {
        var self = this;
        var content = new ContentSlide();
        content.id = id;

        // Ensure the templates are loaded.
        SlideTemplates.load(function() {
            // Get the slides.
            $.getJSON(content.url(), function(data) {
                // Read the slide data.
                content.readData(data[0]);
                self.contentSlide = content;
                
                // Display the slide
                self.changeSlide();
            });
        });
    }

    // Starts editing a new content
    this.newContent = function() {
        // Initialize the content
        this.contentSlide = new ContentSlide();
        this.isNewContent = true;
        this.isFirstTemplateBeingSelected = true;

        // Use the slide container
        this.changeSlide();

        // Perform the template selection.
        this.templateSelection();
    }

    this.useTemplate = function (template) {
        this.contentSlide.view.changeCssClass(template.css_class);
    }

    // Makes the slide content editable.
    this.makeEditable = function() {
        var view = this.contentSlide.view;

        // Use the content editable to create a richer experience.
        view.title.attr("contenteditable", true);
        view.title.keydown(this.onTitleKeyDown);

        view.text.attr("contenteditable", true);
        view.text.on("input", this.onTextKeyDown);
    }

    // This opens the template selection dialog.
    this.templateSelection = function () {
        var self = this;

        SlideTemplates.load(function() {
            self.performTemplateSelection();
        });
    }

    // Handle keydown when editing the title.
    this.onTitleKeyDown = function(event) {
        // Filter some keypresses
        if(event.which == 13) // Return
            return false;
        return true;
    }

    // Handle keydown when editing the text.
    this.onTextKeyDown = function(eventt) {
        // TODO: Filter or catch key presses.
        return true;
    }

    // Helper method to parse dates.
    this.parseDate = function (dateString) {
        $.datepicker
    }

    // This method stores the 
    this.storeMetadata = function() {
        this.contentSlide.start_date = $("#start-date").val();
        this.contentSlide.start_time = $("#start-time").val();
        this.contentSlide.end_date = $("#end-date").val();
        this.contentSlide.end_time = $("#end-time").val();
        this.contentSlide.published = $("#published").is(":checked");
    }

    this.loadMetadata = function() {
        $("#start-date").val(this.contentSlide.start_date);
        $("#start-time").val(this.contentSlide.start_time);
        $("#end-date").val(this.contentSlide.end_date);
        $("#end-time").val(this.contentSlide.end_time);
        $("#published").prop("checked", this.contentSlide.published);
    }

    this.updateModel = function() {
        this.contentSlide.view.updateModel();
        this.storeMetadata();
    }

    this.saveURL = function() {
        if(this.isNewContent)
            return AddContentURL;
        return this.contentSlide.editUrl()
    }

    this.save = function() {
        // Transfer the data from the view into the model.
        var self = this;
        this.updateModel();

        // Encode the data for posting it.
        var data = this.contentSlide.encodeForPost();

        // Post the data.
        $.post(this.saveURL(), data, function(result) {
            // Display the error message.
            if(!result.accepted) {
                self.showValidationErrors(result.errors);
                return;
            }

            // Redirect if creating a new content.
            if(self.isNewContent) {
                self.contentSlide.id = result.id;
                window.location = self.contentSlide.editUrl();
            }
        });
    }

    this.preview = function() {
    }
    this.cancel = function() {
        window.location = IndexURL;
    }
    this.showValidationErrors = function(errors) {
        console.log(errors);
    }
}

ContentEditor.prototype.performTemplateSelection = function() {
    var self = this;

    // Clear the content section.
    var contentSection = $('#contentSection');

    // Template Selection dialog.
    var dialog = $('<ol id="templateSelection" title="Seleccione una plantilla"></ol>"');
    contentSection.append(dialog);

    // Add an element for each template
    var templates = SlideTemplates.all;
    if(this.contentSlide.template == null)
        this.contentSlide.template = templates[0];

    var oldTemplate = this.contentSlide.template;
    var selectedTemplate = templates[0];
    for(var i = 0; i < templates.length; ++i) {
        // Create the template selection element.
        var template = templates[i];
        var templateElement = $('<li class="ui-state-default"></li>');
        var imageElement = $("<img></img>");
        imageElement.attr("alt", template.name);
        imageElement.attr("src", template.image_url);
        templateElement.append(imageElement);

        // Add the element.
        dialog.append(templateElement);

    }
    dialog.selectable({
        stop: function() {
            $( ".ui-selected", this ).each(function() {
                var index = $( "#templateSelection li" ).index( this );
                selectedTemplate = templates[index];
                self.useTemplate(selectedTemplate);
            })
        },

        // Prevent multiple selection.Code snippet taken from:
        // http://stackoverflow.com/questions/861668/how-to-prevent-multiple-selection-in-jquery-ui-selectable-plugin
        selecting: function(event, ui) {
            if( $(".ui-selected, .ui-selecting").length > 1) {
                  $(ui.selecting).removeClass("ui-selecting");
            }
        
        }
    });

    // Open the dialog
    dialog.dialog({
        dialogClass: "no-close",
        modal: true,
        buttons: {
            'Aceptar': function() {
                // Set the selected template in the model.
                self.contentSlide.template = selectedTemplate;

                // This content is not new anymore.
                self.isFirstTemplateBeingSelected = false;

                // Close the dialog
                $(this).dialog("close");
                dialog.remove();
            },
            'Cancelar': function() {
                // If this is a new content, just redirect to the index page.
                if(self.isFirstTemplateBeingSelected) {
                    window.location = BaseURL;
                    return;
                }

                // Restore the old template.
                self.useTemplate(oldTemplate);

                // Close the dialog
                $(this).dialog("close");
                dialog.remove();
            }
        }
    });
}

contentEditor = new ContentEditor();

$(document).ready(function() {
    $( "#format-bold" ).button({
        text: false,
        icons: {primary: 'tango-icon-bold', secondary: null}
    });
    $( "#format-italic" ).button({
        text: false,
        icons: {primary: 'tango-icon-italic', secondary: null}
    });
    $( "#format-underline" ).button({
        text: false,
        icons: {primary: 'tango-icon-underline', secondary: null}
    });

    $( "#edit-undo" ).button({
        text: false,
        icons: {primary: 'tango-icon-undo', secondary: null}
    });
    $( "#edit-redo" ).button({
        text: false,
        icons: {primary: 'tango-icon-redo', secondary: null}
    });

    $( "#slide-template" ).button();
});

