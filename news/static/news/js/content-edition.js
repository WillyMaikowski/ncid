// The application base URL.
var BaseURL = '/news/';
var IndexURL = BaseURL;

// The content editor.
function ContentEditor() {
    this.isNewContent = false;
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
        this.makeEditable();
    }

    this.newContent = function() {
        // Initialize the content
        this.contentSlide = new ContentSlide();
        this.isNewContent = true;

        // Use the slide container
        this.changeSlide();

        // Perform the template selection.
        this.templateSelection();
    }

    this.useTemplate = function (template) {
        this.contentSlide.view.changeCssClass(template.css_class);
    }

    this.makeEditable = function() {
        var view = this.contentSlide.view;

        // Use the content editable to create a richer experience.
        view.title.attr("contenteditable", true);
        view.title.keydown(this.onTitleKeyDown);

        view.text.attr("contenteditable", true);
        view.text.on("input", this.onTextKeyDown);
    }

    this.templateSelection = function () {
        var self = this;

        SlideTemplates.load(function() {
            self.performTemplateSelection();
        });
    }

    this.onTitleKeyDown = function(event) {
        // Filter some keypresses
        if(event.which == 13) // Return
            return false;
        return true;
    }

    this.onTextKeyDown = function(eventt) {
        // TODO: Filter or catch key presses.
        return true;
    }

    this.save = function() {
    }
    this.preview = function() {
    }
    this.cancel = function() {
        window.location = IndexURL;
    }
    this.changed = function() {
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
                // Close the dialog
                self.isNewContent = false;
                $(this).dialog("close");
                dialog.remove();
            },
            'Cancelar': function() {
                // If this is a new content, just redirect to the index page.
                if(self.isNewContent) {
                    window.location = BaseURL;
                    return;
                }

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

