import {addStyling, toggleStyling} from './ToolsStyling';

export function PicksDom(picksElement, disposablePicksElement, createElement, css){
    var pickFilterElement  = createElement('LI');
    
    addStyling(picksElement,       css.picks);
    addStyling(pickFilterElement,  css.pickFilter);


    let disableToggleStyling = toggleStyling(picksElement, css.picks_disabled);
    let focusToggleStyling   = toggleStyling(picksElement, css.picks_focus);
    let isFocusIn = false;

    return {
        picksElement,
        pickFilterElement,

        createPickElement(){
            var pickElement = createElement('LI');
            addStyling(pickElement, css.pick);
            return {
                pickElement, 
                attach: () => picksElement.insertBefore(pickElement, pickFilterElement),
                detach: () => picksElement.removeChild(pickElement)
            };
        },
        disable(isComponentDisabled){
            disableToggleStyling(isComponentDisabled)
        },
        toggleFocusStyling(){
            focusToggleStyling(isFocusIn)
        },
        getIsFocusIn(){
            return isFocusIn;
        },
        setIsFocusIn(newIsFocusIn){
            isFocusIn = newIsFocusIn
        }, 
        
        dispose(){
            if (!disposablePicksElement){
                disableToggleStyling(false)
                focusToggleStyling(false)
                
                if (pickFilterElement.parentNode)
                    pickFilterElement.parentNode.removeChild(pickFilterElement)
            }
        }
    }
}