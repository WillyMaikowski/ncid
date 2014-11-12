// The application base URL.
var BaseURL = '/news/';
var IndexURL = BaseURL;
var AddContentURL = BaseURL + 'content/add';
var EditAutosaveTime = 5000;

// The content editor.
function ContentEditor() {
    var self = this;
    this.isNewContent = false;
    this.isFirstTemplateBeingSelected = false;
    this.contentSlide = null;
    this.titleChanged = false;

    // Rich text editor commands
    this.bold = function() {
        document.execCommand("bold", false, null);
        this.autosave();
    }
    this.italic = function() {
        document.execCommand("italic", false, null);
        this.autosave();
    }
    this.underline = function() {
        document.execCommand("underline", false, null);
        this.autosave();
    }
    this.undo = function() {
        document.execCommand("undo", false, null);
        this.autosave();
    }
    this.redo = function() {
        document.execCommand("redo", false, null);
        this.autosave();
    }

    this.justifyLeft = function() {
        document.execCommand("justifyLeft", false, null);
        this.autosave();
    }

    this.justifyCenter = function() {
        document.execCommand("justifyCenter", false, null);
        this.autosave();
    }

    this.justifyRight = function() {
        document.execCommand("justifyRight", false, null);
        this.autosave();
    }

    this.justifyFull = function() {
        document.execCommand("justifyFull", false, null);
        this.autosave();
    }

    this.removeFormat = function() {
        document.execCommand("removeFormat", false, null);
        this.autosave();
    }

    this.fontSize = function(size) {
        document.execCommand("fontSize", false, size);
        this.autosave();
    }

    this.foreColor = function(color) {
        document.execCommand("foreColor", false, color);
        this.autosave();
    }

    this.changeSlide = function() {
        var slideContainer = $('#slideContainer');
        slideContainer.empty();

        this.contentSlide.renderTo(slideContainer, true);
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
                content.readData(data[0], function() {
                    self.contentSlide = content;
                    self.contentSlide.useDraft()
                    
                    // Display the slide
                    self.changeSlide();
                });
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
        this.contentSlide.template = template;
        this.contentSlide.view.update(true);
    }

    // Makes the slide content editable.
    this.makeEditable = function() {
        var view = this.contentSlide.view;

        // Use the content editable to create a richer experience.
        view.title.attr("contenteditable", true);
        view.title.keydown(this.onTitleKeyDown);
        view.title.on("blur paste input", this.onTitleChanged);

        view.text.attr("contenteditable", true);
        view.text.keydown("input", this.onTextKeyDown);
        view.text.on("blur paste input", this.onTextChanged);

        view.image.click(function() {
            $('#imageUploadModal').modal();
        })
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

    this.onTitleChanged = function(event) {
        this.titleChanged = true;
        self.scheduleAutosave();
    }

    // Handle keydown when editing the text.
    this.onTextKeyDown = function(event) {
        // TODO: Filter or catch key presses.
        return true;
    }

    this.onTextChanged = function(event) {
        self.updateContentCharacterCount();
        self.scheduleAutosave();
    }

    // Handle keydown when editing the text.
    this.onTextKeyDown = function(event) {
        // TODO: Filter or catch key presses.
        return true;
    }

    this.onDurationChanged = function(event) {
        self.scheduleAutosave();
    }

    this.onTagChanged = function(event) {
        self.autosave();
    }

    // Update the content character counter.
    // TODO: Adjust for font size.
    this.updateContentCharacterCount = function() {
        var text = this.contentSlide.view.text.text();
        $("#content-character-count").html("Caracteres: " + text.length);
    }

    // Helper method to parse dates.
    this.parseDate = function (dateString) {
        $.datepicker
    }

    // This method stores the 
    this.storeMetadata = function() {
        this.contentSlide.circulation_start = $("#circulation-start").val();
        this.contentSlide.circulation_end = $("#circulation-end").val();
        this.contentSlide.published = $("#published").is(":checked");
        this.contentSlide.display_duration = $("#display-duration").val();
        this.contentSlide.tag = $("#tag-selection").val();
    }

    this.loadMetadata = function() {
        $("#circulation-start").val(this.contentSlide.circulationStart());
        $("#circulation-end").val(this.contentSlide.circulationEnd());
        $("#display-duration").val(this.contentSlide.display_duration);
        $("#published").prop("checked", this.contentSlide.published);
        $("#tag-selection").val(this.contentSlide.tag);
        this.updateContentCharacterCount();
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

    // The autosave keeps the current draft flag.
    this.autosave = function() {
        this.onScheduledAutosave = function() {};
        this.performSave(true);
    }

    // Delayed autosave. Used for text input.
    this.onScheduledAutosave = function() {};
    this.scheduleAutosave = function() {
        var self = this;
        this.onScheduledAutosave = this.autosave;
        window.setTimeout(function() {self.onScheduledAutosave();}, EditAutosaveTime);
    }

    // The save button removes the draft flag.
    this.save = function() {
        this.performSave(false, function() {
            window.location = BaseURL;
        });
    }

    // This performs a save.
    this.performSave = function(asDraft, afterAction) {
        // Transfer the data from the view into the model.
        var self = this;
        this.updateModel();

        // Encode the data for posting it.
        var wasDraft = this.contentSlide.draft;
        this.contentSlide.draft = asDraft;
        var data = this.contentSlide.encodeForPost();

        // Post the data.
        $.post(this.saveURL(), data, function(result) {
            // Display the error message.
            if(!result.accepted) {
                self.showValidationErrors(result.errors);
                return;
            }
            self.removeErrors();

            // Redirect if creating a new content.
            if(self.isNewContent) {
                self.contentSlide.id = result.id;
                window.location = self.contentSlide.editUrl();
                return;
            }

            // Update the draft bar
            if(this.titleChanged || asDraft || wasDraft != asDraft)
                draftBar.load();
            this.titleChanged = false;

            // Peform the after action.
            if(afterAction)
                afterAction();
        });
    }

    this.preview = function() {
        this.autosave();
        var win = window.open(this.contentSlide.previewUrl(), '_blank');
        return win;
    }

    this.publishedChanged = function() {
        this.autosave();
    }

    this.cancel = function() {
        $.post(this.saveURL(), {cancel:true}, function(result) {
            window.location = IndexURL;
        });
    }

    this.delete = function() {
        $.post(this.saveURL(), {'delete':true}, function(result) {
            window.location = IndexURL;
        });
    }

    this.showValidationErrors = function(errors) {
        var names = {
            title: 'Titulo',
            text: 'Texto',
            content: 'Contenido',
            image: 'Imagen',

            display_duration: 'Duración en Pantalla',
            circulation_start: 'Comienzo de Circulación',
            circulation_end: 'Fin de Circulación',

            published: 'Publicado',
        };

        // Add a list with the errors.
        var list = $("<ul />");
        $("#slideErrorMessages").empty().append(list);

        // Add the error messages.
        for(var element in errors) {
            var elementMessage = errors[element];
            var elementName = names[element];
            if(!elementName)
                elementName = element;

            var display = $("<li />").html(elementName + ': ' + elementMessage);
            list.append(display);
        }
    }

    this.removeErrors = function() {
        $("#slideErrorMessages").empty();
    }

    // Register the event handlers.
    this.templateSelectionAction = function(value) {
        console.log("selection Action " + value)
    }

    this.registerTemplateSelectionAction = function() {
        var self = this;
        var accepted = false;
        $('#selectTemplateModal').on('hide.bs.modal', function(e) {
            self.templateSelectionAction(accepted);
        })

        $("#selectTemplateCancel").click(function() {
            accepted = false;
        });

        $("#selectTemplateOK").click(function() {
            accepted = true;
        });
    }
}

ContentEditor.prototype.performTemplateSelection = function() {
    var self = this;

    // Clear the content section.
    var contentSection = $('#contentSection');

    // Template Selection dialog.
    var dialog = $('#selectTemplateModal')
    var dialogBody = $('#selectTemplateModalBody');
    dialogBody.empty()

    // Add an element for each template
    var templates = SlideTemplates.all;
    if(this.contentSlide.template == null)
        this.contentSlide.template = templates[0];

    var oldTemplate = this.contentSlide.template;
    var selectedTemplate = templates[0];
    var selectionElements = [];

    function templateClickHandlerFor(index) {
        return function(event) {
            selectedTemplate = templates[index];
            self.useTemplate(selectedTemplate);
            for(var i = 0; i < selectionElements.length; ++i) {
                if(index  == i)
                    continue;
                selectionElements[i].removeClass('active');
            }
        }
    }

    for(var i = 0; i < templates.length; ++i) {
        // Create the template selection element.
        var template = templates[i];
        var buttonElement = $('<button type="button" class="btn"></button>');
        buttonElement.click(templateClickHandlerFor(i));

        // Set the active attribute for the selected template.
        if(template == oldTemplate)
            buttonElement.addClass('active');

        // Display the template using an image.
        var imageElement = $("<img></img>");
        buttonElement.append(imageElement);
        imageElement.attr("alt", template.name);
        imageElement.attr("src", template.image_url);

        // Add the element.
        dialogBody.append(buttonElement);
        selectionElements.push(buttonElement);

    }

    // Open the dialog
    dialog.modal({
        backdrop: 'static',
        keyboard: false
    });

    this.templateSelectionAction = function(result) {
        if(result) {
            // Set the selected template in the model.
            self.contentSlide.template = selectedTemplate;

            // This content is not new anymore.
            self.isFirstTemplateBeingSelected = false;

            // Autosave the template change.
            self.autosave();
        }
        else {
            // If this is a new content, just redirect to the index page.
            if(self.isFirstTemplateBeingSelected) {
                window.location = BaseURL;
                return;
            }

            // Restore the old template.
            self.useTemplate(oldTemplate);
        }
    }
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

    // Metadata edition events.
    $( "#display-duration").on("input", contentEditor.onDurationChanged);
    $( "#tag-selection").change(contentEditor.onTagChanged)

    contentEditor.registerTemplateSelectionAction();
});

