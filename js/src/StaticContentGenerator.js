import {findDirectChildByTagName, closestByClassName, AttributeBackup} from './ToolsDom';
import  {addStyling, toggleStyling} from './ToolsStyling';

export function staticContentGenerator(element, createElement, containerClass, putRtlToContainer, css) { 
    var selectElement = null;
    var containerElement = null;
    if (element.tagName=='SELECT'){
        selectElement = element;
        if (containerClass){
            containerElement = closestByClassName(selectElement, containerClass)
            // TODO: do I need this?    
            //if (selectElement.nextSibling  && selectElement.nextSibling.classList.contains(containerClass) )
            //    containerElement = selectElement.parentNode;
        }
    }
    else if (element.tagName=="DIV")
    { 
        containerElement = element;
        selectElement = findDirectChildByTagName(element, 'SELECT');
    }
    else 
    {
        element.style.backgroundColor = 'red';
        element.style.color = 'white';
        throw new Error('BsMultiSelect: Only DIV and SELECT supported');
    }

    var picksElement = null;
    var ownPicksElement = false;
    if (containerElement)
        picksElement = findDirectChildByTagName(containerElement, 'UL');
    if (!picksElement){
        picksElement = createElement('UL');
        ownPicksElement = true;
    }
    
    var createPickElement = () => {
        var pickElement = createElement('LI');
        addStyling(pickElement, css.pick);
        return pickElement;
    }

    var createChoiceElement = () => {
        var choiceElement = createElement('LI');
        addStyling(choiceElement, css.choice);
        return choiceElement;
    }

    var ownContainerElement = false;        
    if (!containerElement){
        containerElement = createElement('DIV');
        ownContainerElement= true;
    }
    containerElement.classList.add(containerClass);

    var attributeBackup = AttributeBackup();
    if (putRtlToContainer){
        attributeBackup.set(containerElement, "dir", "rtl");
    }
    else if (selectElement){
        var dirAttributeValue = selectElement.getAttribute("dir");
        if (dirAttributeValue){
            attributeBackup.set(containerElement, "dir", dirAttributeValue);
        }
    } 

    var choicesElement = createElement('UL');
    choicesElement.style.display="none";
    
    var backupDisplay = null;
    if (selectElement){ 
        backupDisplay = selectElement.style.display;
        selectElement.style.display='none';
    }
    
    var pickFilterElement = createElement('LI');
    var filterInputElement = createElement('INPUT');
    var required =false;
    var backupedRequired = selectElement.required;
    if (selectElement){
         if(selectElement.required===true){
            required=true;
            selectElement.required = false;
         }
    }


    addStyling(picksElement,       css.picks);
    addStyling(choicesElement,     css.choices);
    addStyling(pickFilterElement,  css.pickFilter);
    addStyling(filterInputElement, css.filterInput);

    var createInputId = null;
    if(selectElement)
        createInputId = () => `${containerClass}-generated-input-${((selectElement.id)?selectElement.id:selectElement.name).toLowerCase()}-id`;
    else
        createInputId = () => `${containerClass}-generated-filter-${containerElement.id}`;

    return {
        selectElement, 
        containerElement,
        picksElement,
        createPickElement,
        choicesElement,
        createChoiceElement,
        pickFilterElement,
        filterInputElement,
        createInputId,
        required,
        attachContainer(){
            if (ownContainerElement && selectElement) // otherwise it is attached
                selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling);
        },
        appendToContainer(){
            if (ownContainerElement || !selectElement)            
            {
                if (ownPicksElement)
                    containerElement.appendChild(picksElement);
                containerElement.appendChild(choicesElement);
            }
            else
            {
                if (selectElement)
                {
                    // TODO picksElement element should be moved to attach
                    selectElement.parentNode.insertBefore(choicesElement, selectElement.nextSibling);
                    if (ownPicksElement)
                        selectElement.parentNode.insertBefore(picksElement, choicesElement);
                }
            }
        },
        disable(isDisabled){
            toggleStyling(picksElement, css.picks_disabled, isDisabled)
        },
        focus(isFocusIn){
            toggleStyling(picksElement, css.picks_focus, isFocusIn)
        },
        dispose(){
            if (ownContainerElement)
                containerElement.parentNode.removeChild(containerElement);
            else
                attributeBackup.restore();
            if (ownPicksElement)
                picksElement.parentNode.removeChild(picksElement);
            choicesElement.parentNode.removeChild(choicesElement);
            if (pickFilterElement.parentNode)
                pickFilterElement.parentNode.removeChild(pickFilterElement);
            if (filterInputElement.parentNode)
                filterInputElement.parentNode.removeChild(filterInputElement);
            if (selectElement){
                selectElement.required = backupedRequired;
                selectElement.style.display = backupDisplay;
            }
        }
    }
}