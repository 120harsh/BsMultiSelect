import { PluginManager, plugStaticDom } from './PluginManager';
import { composeSync } from './ToolsJs';
import { PickDomFactory } from './PickDomFactory';
import { ChoiceDomFactory } from './ChoiceDomFactory';
import { StaticDomFactory, CreateElementAspect } from './StaticDomFactory';
import { PicksDom } from './PicksDom';
import { FilterDom } from './FilterDom';
import { ChoicesDomFactory } from './ChoicesDomFactory';
import { PopupAspect } from './PopupAspect';
import { ComponentPropertiesAspect, TriggerAspect, OnChangeAspect } from './ComponentPropertiesAspect';
import { OptionsAspect, OptionPropertiesAspect } from './OptionsAspect';
import { DoublyLinkedCollection } from './ToolsJs';
import { FilterListAspect, ChoicesGetNextAspect, ChoicesEnumerableAspect } from './FilterListAspect';
import { BuildAndAttachChoiceAspect, BuildChoiceAspect } from './BuildChoiceAspect';
import { FillChoicesAspect } from './FillChoicesAspect';
import { UpdateDataAspect } from './UpdateDataAspect';
import { OptionToggleAspect } from './OptionToggleAspect';
import { CreateChoiceAspect, IsChoiceSelectableAspect, SetOptionSelectedAspect } from './CreateChoiceAspect.js';
import { Choices } from './Choices';
import { ChoicesHover } from './ChoicesHover';
import { Picks } from './Picks';
import { BuildPickAspect } from './BuildPickAspect';
import { InputAspect } from './InputAspect';
import { ResetFilterListAspect } from './ResetFilterListAspect';
import { ManageableResetFilterListAspect } from './ResetFilterListAspect';
import { FocusInAspect } from './ResetFilterListAspect';
import { MultiSelectInputAspect } from './MultiSelectInputAspect';
import { FilterAspect } from './FilterAspect';
import { DisabledComponentAspect, LoadAspect, AppearanceAspect } from './AppearanceAspect'; /// environment - common for many; configuration for concreate

export function BsMultiSelect(element, environment, configuration, onInit) {
  var Popper = environment.Popper,
      window = environment.window,
      plugins = environment.plugins;

  if (typeof Popper === 'undefined') {
    throw new Error("BsMultiSelect: Popper.js (https://popper.js.org) is required");
  }

  var containerClass = configuration.containerClass,
      css = configuration.css,
      getDisabled = configuration.getDisabled,
      options = configuration.options,
      getText = configuration.getText,
      getSelected = configuration.getSelected,
      setSelected = configuration.setSelected,
      getIsOptionDisabled = configuration.getIsOptionDisabled;
  var disposeAspect = {};
  var triggerAspect = TriggerAspect(element, environment.trigger);
  var onChangeAspect = OnChangeAspect(triggerAspect, 'dashboardcode.multiselect:change');
  var componentPropertiesAspect = ComponentPropertiesAspect(getDisabled != null ? getDisabled : function () {
    return false;
  });
  var optionsAspect = OptionsAspect(options);
  var optionPropertiesAspect = OptionPropertiesAspect(getText, getSelected, setSelected, getIsOptionDisabled);
  var isChoiceSelectableAspect = IsChoiceSelectableAspect();
  var createChoiceAspect = CreateChoiceAspect(optionPropertiesAspect);
  var setOptionSelectedAspect = SetOptionSelectedAspect(optionPropertiesAspect);
  var optionToggleAspect = OptionToggleAspect(setOptionSelectedAspect);
  var createElementAspect = CreateElementAspect(function (name) {
    return window.document.createElement(name);
  });
  var choicesDomFactory = ChoicesDomFactory(createElementAspect);
  var staticDomFactory = StaticDomFactory(choicesDomFactory, createElementAspect);
  var collection = DoublyLinkedCollection(function (choice) {
    return choice.itemPrev;
  }, function (choice, v) {
    return choice.itemPrev = v;
  }, function (choice) {
    return choice.itemNext;
  }, function (choice, v) {
    return choice.itemNext = v;
  });
  var choicesGetNextAspect = ChoicesGetNextAspect(function () {
    return collection.getHead();
  }, function (choice) {
    return choice.itemNext;
  });
  var choicesEnumerableAspect = ChoicesEnumerableAspect(choicesGetNextAspect);
  var filterListAspect = FilterListAspect(choicesEnumerableAspect);
  var choicesHover = ChoicesHover(function (down, hoveredChoice) {
    return filterListAspect.navigate(down, hoveredChoice);
  });
  var picks = Picks();
  var choices = Choices(collection, function () {
    return filterListAspect.reset();
  }, function (c) {
    return filterListAspect.remove(c);
  }, function (c) {
    return filterListAspect.insertFilterFacade(c);
  }, choicesGetNextAspect);
  var aspects = {
    environment: environment,
    configuration: configuration,
    triggerAspect: triggerAspect,
    onChangeAspect: onChangeAspect,
    componentPropertiesAspect: componentPropertiesAspect,
    disposeAspect: disposeAspect,
    optionsAspect: optionsAspect,
    optionPropertiesAspect: optionPropertiesAspect,
    createChoiceAspect: createChoiceAspect,
    setOptionSelectedAspect: setOptionSelectedAspect,
    isChoiceSelectableAspect: isChoiceSelectableAspect,
    optionToggleAspect: optionToggleAspect,
    createElementAspect: createElementAspect,
    choicesDomFactory: choicesDomFactory,
    staticDomFactory: staticDomFactory,
    choicesGetNextAspect: choicesGetNextAspect,
    choicesEnumerableAspect: choicesEnumerableAspect,
    filterListAspect: filterListAspect,
    choicesHover: choicesHover,
    picks: picks,
    choices: choices
  };
  plugStaticDom(plugins, aspects); // apply cssPatch to css, apply selectElement support;  

  var _staticDomFactory$cre = staticDomFactory.create(css),
      choicesDom = _staticDomFactory$cre.choicesDom,
      createStaticDom = _staticDomFactory$cre.createStaticDom;

  var _createStaticDom = createStaticDom(element, containerClass),
      staticDom = _createStaticDom.staticDom,
      staticManager = _createStaticDom.staticManager; // after this we can use staticDom in construtctor, this simplifies parameter passing a lot   


  var filterDom = FilterDom(staticDom.disposablePicksElement, createElementAspect, css);
  var popupAspect = PopupAspect(choicesDom.choicesElement, filterDom.filterInputElement, Popper);
  var resetFilterListAspect = ResetFilterListAspect(filterDom, filterListAspect);
  var manageableResetFilterListAspect = ManageableResetFilterListAspect(filterDom, resetFilterListAspect);
  var inputAspect = InputAspect(filterListAspect, setOptionSelectedAspect, choicesHover, filterDom, popupAspect); // TODO get picksDom  from staticDomFactory

  var picksDom = PicksDom(staticDom.picksElement, staticDom.disposablePicksElement, createElementAspect, css);
  var focusInAspect = FocusInAspect(picksDom);
  var pickDomFactory = PickDomFactory(css, componentPropertiesAspect, optionPropertiesAspect);
  var createPickAspect = BuildPickAspect(setOptionSelectedAspect, picks, picksDom, pickDomFactory);
  var choiceDomFactory = ChoiceDomFactory(css, optionPropertiesAspect);
  var buildChoiceAspect = BuildChoiceAspect(choicesDom, filterDom, choiceDomFactory, onChangeAspect, optionToggleAspect, createPickAspect);
  var buildAndAttachChoiceAspect = BuildAndAttachChoiceAspect(buildChoiceAspect, choicesGetNextAspect);
  var fillChoicesAspect = FillChoicesAspect(window.document, createChoiceAspect, optionsAspect, choices, buildAndAttachChoiceAspect); // -----------

  var multiSelectInputAspect = MultiSelectInputAspect(window, function () {
    return filterDom.setFocus();
  }, picksDom.picksElement, choicesDom.choicesElement, function () {
    return popupAspect.isChoicesVisible();
  }, function (visible) {
    return popupAspect.setChoicesVisible(visible);
  }, function () {
    return choicesHover.resetHoveredChoice();
  }, function (choice) {
    return choicesHover.hoverIn(choice);
  }, function () {
    return manageableResetFilterListAspect.resetFilter();
  },
  /*isChoicesListEmpty*/
  function () {
    return filterListAspect.getCount() == 0;
  },
  /*onClick*/
  function (event) {
    return filterDom.setFocusIfNotTarget(event.target);
  },
  /*resetFocus*/
  function () {
    return focusInAspect.setFocusIn(false);
  },
  /*alignToFilterInputItemLocation*/
  function () {
    return popupAspect.updatePopupLocation();
  });
  var disabledComponentAspect = DisabledComponentAspect(componentPropertiesAspect, picks, multiSelectInputAspect, picksDom);
  var appearanceAspect = AppearanceAspect(disabledComponentAspect);
  var loadAspect = LoadAspect(fillChoicesAspect, multiSelectInputAspect, appearanceAspect);

  function hoveredToSelected() {
    var hoveredChoice = choicesHover.getHoveredChoice();

    if (hoveredChoice) {
      var wasToggled = optionToggleAspect.toggle(hoveredChoice);

      if (wasToggled) {
        multiSelectInputAspect.hideChoices();
        manageableResetFilterListAspect.resetFilter();
      }
    }
  }

  function keyDownArrow(down) {
    var choice = choicesHover.navigate(down);

    if (choice) {
      choicesHover.hoverIn(choice);
      multiSelectInputAspect.showChoices();
    }
  }

  var filterAspect = FilterAspect(filterDom.filterInputElement, function () {
    return focusInAspect.setFocusIn(true);
  }, // focus in - show dropdown
  function () {
    return multiSelectInputAspect.onFocusOut(function () {
      return focusInAspect.setFocusIn(false);
    });
  }, // focus out - hide dropdown
  function () {
    return keyDownArrow(false);
  }, // arrow up
  function () {
    return keyDownArrow(true);
  }, // arrow down

  /*onTabForEmpty*/
  function () {
    return multiSelectInputAspect.hideChoices();
  }, // tab on empty
  function () {
    var p = picks.removePicksTail();
    if (p) popupAspect.updatePopupLocation();
  }, // backspace - "remove last"

  /*onTabToCompleate*/
  function () {
    if (popupAspect.isChoicesVisible()) {
      hoveredToSelected();
    }
  },
  /*onEnterToCompleate*/
  function () {
    if (popupAspect.isChoicesVisible()) {
      hoveredToSelected();
    } else {
      if (filterListAspect.getCount() > 0) {
        multiSelectInputAspect.showChoices();
      }
    }
  },
  /*onKeyUpEsc*/
  function () {
    multiSelectInputAspect.hideChoices(); // always hide 1st

    manageableResetFilterListAspect.resetFilter();
  }, // esc keyup 
  // tab/enter "compleate hovered"

  /*stopEscKeyDownPropogation */
  function () {
    return popupAspect.isChoicesVisible();
  },
  /*onInput*/
  function (filterInputValue, resetLength) {
    inputAspect.input(filterInputValue, resetLength, function () {
      return multiSelectInputAspect.eventLoopFlag.set();
    }, function () {
      return multiSelectInputAspect.showChoices();
    }, function () {
      return multiSelectInputAspect.hideChoices();
    });
  });
  var updateDataAspect = UpdateDataAspect(multiSelectInputAspect, manageableResetFilterListAspect, choicesDom, choices, picks, fillChoicesAspect);
  aspects.pickDomFactory = pickDomFactory;
  aspects.choiceDomFactory = choiceDomFactory;
  aspects.staticDom = staticDom;
  aspects.picksDom = picksDom;
  aspects.choicesDom = choicesDom;
  aspects.popupAspect = popupAspect;
  aspects.staticManager = staticManager;
  aspects.buildChoiceAspect = buildChoiceAspect;
  aspects.buildAndAttachChoiceAspect = buildAndAttachChoiceAspect;
  aspects.fillChoicesAspect = fillChoicesAspect;
  aspects.createPickAspect = createPickAspect;
  aspects.filterDom = filterDom;
  aspects.inputAspect = inputAspect;
  aspects.resetFilterListAspect = resetFilterListAspect;
  aspects.manageableResetFilterListAspect = manageableResetFilterListAspect;
  aspects.multiSelectInputAspect = multiSelectInputAspect;
  aspects.focusInAspect = focusInAspect;
  aspects.filterAspect = filterAspect;
  aspects.disabledComponentAspect = disabledComponentAspect;
  aspects.appearanceAspect = appearanceAspect;
  aspects.loadAspect = loadAspect;
  aspects.updateDataAspect = updateDataAspect;
  var pluginManager = PluginManager(plugins, aspects);
  var api = {
    component: "BsMultiSelect.api"
  };
  pluginManager.buildApi(api);
  api.dispose = composeSync(disposeAspect.dispose, multiSelectInputAspect.hideChoices, pluginManager.dispose, picks.dispose, multiSelectInputAspect.dispose, choices.dispose, staticManager.dispose, popupAspect.dispose, picksDom.dispose, filterDom.dispose, filterAspect.dispose);
  api.updateData = updateDataAspect.updateData;

  api.update = function () {
    updateDataAspect.updateData();
    appearanceAspect.updateAppearance();
  };

  api.updateAppearance = appearanceAspect.updateAppearance;
  api.updateDisabled = disabledComponentAspect.updateDisabledComponent;
  onInit == null ? void 0 : onInit(api, aspects);
  picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
  picksDom.picksElement.appendChild(picksDom.pickFilterElement);
  staticManager.appendToContainer();
  popupAspect.init();
  loadAspect.load();
  return api;
}

//# sourceMappingURL=BsMultiSelect.js.map