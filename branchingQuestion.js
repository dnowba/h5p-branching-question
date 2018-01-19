H5P.BranchingQuestion = (function ($) {

  function BranchingQuestion(parameters, id) {
    var self = this;
    self.firstFocusable;
    self.lastFocusable;
    H5P.EventDispatcher.call(self);

    var createWrapper = function() {
      var wrapper = document.createElement('div');
      wrapper.classList.add('h5p-branching-question');

      var icon = document.createElement('img');
      icon.classList.add('h5p-branching-question-icon');
      icon.src = self.getLibraryFilePath('branching-question-icon.svg');

      wrapper.append(icon);

      return wrapper;
    };

    var appendMultiChoiceSection = function(parameters, wrapper) {
      var questionWrapper = document.createElement('div');
      questionWrapper.classList.add('h5p-multichoice-wrapper');

      var title = document.createElement('div');
      title.classList.add('h5p-branching-question-title');
      title.innerHTML = parameters.question;

      questionWrapper.append(title);

      for (var i = 0; i < parameters.alternatives.length; i++) {
        var alternative = createAlternativeContainer(parameters.alternatives[i].text);

        if (i === 0) {
          self.firstFocusable = alternative;
        }

        if (i === parameters.alternatives.length - 1) {
          self.lastFocusable = alternative;
        }

        alternative.nextContentId = parameters.alternatives[i].nextContentId;

        // Create feedback screen if it exists
        if (parameters.alternatives[i].addFeedback) {
          alternative.feedbackScreen = createFeedbackScreen(parameters.alternatives[i].feedback, alternative.nextContentId);
          alternative.proceedButton = alternative.feedbackScreen.querySelectorAll('button')[0];
        }

        alternative.addEventListener('keyup', function(event) {
          if (event.which == 13 || event.which == 32) {
            this.click();
          }
        });

        alternative.onclick = function() {
          if (this.feedbackScreen !== undefined) {
            wrapper.innerHTML = '';
            wrapper.append(this.feedbackScreen);
            this.proceedButton.focus();
            self.triggerXAPI('interacted');
          }
          else {
            self.trigger('navigated', this.nextContentId);
          }
        };
        questionWrapper.append(alternative);
      }

      wrapper.append(questionWrapper);
      return wrapper;
    };

    var createAlternativeContainer = function(text) {
      var wrapper = document.createElement('div');
      wrapper.classList.add('h5p-branching-question-alternative');
      wrapper.tabIndex = 0;

      var alternativeText = document.createElement('p');
      alternativeText.innerHTML = text;

      wrapper.append(alternativeText);
      return wrapper;
    };

    var createFeedbackScreen = function(feedback, nextContentId) {

      var wrapper = document.createElement('div');
      wrapper.classList.add('h5p-branching-question');
      wrapper.classList.add(feedback.image !== undefined ? 'h5p-feedback-has-image' : 'h5p-feedback-default');

      if (feedback.image !== undefined && feedback.image.path !== undefined) {
        var imageContainer = document.createElement('div');
        imageContainer.classList.add('h5p-branching-question');
        imageContainer.classList.add('h5p-feedback-image');
        var image = document.createElement('img');
        image.src = H5P.getPath(feedback.image.path, self.contentId);
        imageContainer.append(image);
        wrapper.append(imageContainer);
      }

      var feedbackContent = document.createElement('div');
      feedbackContent.classList.add('h5p-branching-question');
      feedbackContent.classList.add('h5p-feedback-content');

      var title = document.createElement('h1');
      title.innerHTML = feedback.title;
      feedbackContent.append(title);

      if (feedback.subtitle) {
        var subtitle = document.createElement('h2');
        subtitle.innerHTML = feedback.subtitle;
        feedbackContent.append(subtitle);
      }

      var navButton = document.createElement('button');
      navButton.onclick = function() {
        self.trigger('navigated', nextContentId);
      };

      var text = document.createTextNode(parameters.proceedButtonText);
      navButton.append(text);

      feedbackContent.append(navButton);

      var KEYCODE_TAB = 9;
      feedbackContent.addEventListener('keydown', function(e) {
        var isTabPressed = (e.key === 'Tab' || e.keyCode === KEYCODE_TAB);
        if (isTabPressed) {
          e.preventDefault();
          return;
        }
      });

      wrapper.append(feedbackContent);

      return wrapper;
    };

    //https://hiddedevries.nl/en/blog/2017-01-29-using-javascript-to-trap-focus-in-an-element
    var trapFocus = function(element) {
      var KEYCODE_TAB = 9;
      element.addEventListener('keydown', function(e) {
        var isTabPressed = (e.key === 'Tab' || e.keyCode === KEYCODE_TAB);

        if (!isTabPressed) {
          return;
        }

        if (e.shiftKey && document.activeElement === self.firstFocusable) /* shift + tab */ {
          self.lastFocusable.focus();
          e.preventDefault();
        }
        else if (document.activeElement === self.lastFocusable) { /* tab */
          self.firstFocusable.focus();
          e.preventDefault();
        }
      });
    };

    self.attach = function ($container) {
      var questionContainer = document.createElement('div');
      questionContainer.classList.add('h5p-branching-question-container');

      var branchingQuestion = createWrapper(parameters);
      branchingQuestion = appendMultiChoiceSection(parameters, branchingQuestion);
      trapFocus(branchingQuestion);

      questionContainer.append(branchingQuestion);
      $container.append(questionContainer);
    };
  }

  return BranchingQuestion;

})();
