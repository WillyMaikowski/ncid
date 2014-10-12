// The application base URL.
var BaseURL = '/news/';

// The content editor.
function ContentEditor() {
    this.isNewContent = false;
    this.contentSlide = null;

    this.bold = function() {
        document.execCommand("bold", false, null);
    }
    this.italic = function() {
        document.execCommand("italic", false, null);
    }
    this.underline = function() {
        document.execCommand("underline", false, null);
    }
}

ContentEditor.prototype.changeSlide = function() {
    var slideContainer = $('#slideContainer');
    slideContainer.empty();

    this.contentSlide.renderTo(slideContainer);
    this.makeEditable();
}

ContentEditor.prototype.newContent = function() {
    var self = this;

    // Initialize the content
    self.contentSlide = new ContentSlide();
    self.isNewContent = true;

    // Use the slide container
    self.changeSlide();

    // Perform the template selection.
    SlideTemplates.load(function() {
        self.performTemplateSelection();
    });
}

ContentEditor.prototype.useTemplate = function (template) {
    this.contentSlide.view.changeCssClass(template.css_class);
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
        templateElement.html(template.name);

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
        modal: true,
        buttons: {
            'Aceptar': function() {
                // Close the dialog
                self.isNewContent = false;
                $(this).dialog("close");
            },
            'Cancelar': function() {
                // If this is a new content, just redirect to the index page.
                if(self.isNewContent) {
                    window.location = BaseURL;
                    return;
                }

                // Close the dialog
                $(this).dialog("close");
            }
        }
    });
}

ContentEditor.prototype.makeEditable = function() {
    var view = this.contentSlide.view;

    // Use the content editable to create a richer experience.
    view.title.attr("contenteditable", true);
    view.title.keydown(this.onTitleKeyDown);

    view.text.attr("contenteditable", true);
    view.text.on("input", this.onTextKeyDown);
}

ContentEditor.prototype.onTitleKeyDown = function(event) {
    // Filter some keypresses
    if(event.which == 13) // Return
        return false;
    return true;
}

ContentEditor.prototype.onTextKeyDown = function(eventt) {
    // TODO: Filter or catch key presses.
    return true;
}

contentEditor = new ContentEditor();

