export function HiddenOptionPlugin(pluginData){
    let {configuration, options,choices, multiSelectInputAspect, choicesGetNextAspect, 
        optionAspect, choicesEnumerableAspect, filterListAspect, 
        dataSourceAspect,
        choiceFactoryAspect, choicesElementAspect} = pluginData;
    let {getIsOptionHidden} = configuration;
    if (options){
        if (!getIsOptionHidden)
            getIsOptionHidden = (option)=>(option.hidden===undefined)?false:option.hidden;     
    } else{
        if (!getIsOptionHidden)
            getIsOptionHidden = (option)=>option.hidden;     
    }

    choicesGetNextAspect.getNext = (c)=>getNextNonHidden(c);

    choicesEnumerableAspect.forEach = (f) => {
        let choice = choicesGetNextAspect.getHead();
        while(choice){
            if (!choice.isOptionHidden)
                f(choice);
            choice = choicesGetNextAspect.getNext(choice);
        }
    }    

    var origAddFilterFacade = filterListAspect.addFilterFacade;
    filterListAspect.addFilterFacade = (choice) => {
        if ( !choice.isOptionHidden ) {
            origAddFilterFacade(choice);
        }
    }
    
    var origInsertFilterFacade = filterListAspect.insertFilterFacade;
    filterListAspect.insertFilterFacade = (choice) => {
        if ( !choice.isOptionHidden ){
            origInsertFilterFacade(choice);
        }
    }

    function buildHiddenChoice(choice){
        choice.updateSelected = () => void 0;
        choice.updateDisabled = () => void 0;
        
        choice.choiceElement = null;
        choice.choiceElementAttach = null;
        choice.setVisible = null; 
        choice.setHoverIn = null;
        choice.remove = null; 
        
        choice.dispose = () => { 
            choice.dispose = null;
        };
    }

    let origInsertChoiceItem = choiceFactoryAspect.insertChoiceItem;
    let origPushChoiceItem = choiceFactoryAspect.pushChoiceItem;
        
    
    choiceFactoryAspect.insertChoiceItem=(choice, adoptChoiceElement, handleOnRemoveButton)=>{
        if (choice.isOptionHidden){ 
            buildHiddenChoice(choice);
        }
        else{ 
            origInsertChoiceItem(choice, adoptChoiceElement, handleOnRemoveButton);
        }
    }
    
    choiceFactoryAspect.pushChoiceItem=(choice, adoptChoiceElement, handleOnRemoveButton)=>{
        if (choice.isOptionHidden){ 
            buildHiddenChoice(choice);
        }
        else{ 
            origPushChoiceItem(choice, adoptChoiceElement, handleOnRemoveButton);
        }
    }

    return {
        buildApi(api){
            var origIsSelectable = optionAspect.isSelectable;
            optionAspect.isSelectable = (choice) => origIsSelectable(choice) && !choice.isOptionHidden;
        
            function updateHidden(choice) {
                if (choice.isOptionHidden) {
                    filterListAspect.remove(choice);
                    choice.remove(); 
                    buildHiddenChoice(choice);
                } else {
                    let nextChoice = getNextNonHidden(choice);
                    filterListAspect.add(choice, nextChoice);
                    choicesElementAspect.buildChoiceElement(choice,
                        (c,e)=>multiSelectInputAspect.adoptChoiceElement(c,e),
                        (o,s)=>multiSelectInputAspect.handleOnRemoveButton(o,s)
                        );
                    choice.choiceElementAttach(nextChoice?.choiceElement);
                }
            }
            
            api.updateHidden = (c) => updateHidden(c);
        
            function UpdateOptionHidden(key){
                let choice = choices.get(key);
                updateHiddenChoice(choice, (c)=>updateHidden(c), getIsOptionHidden)
            }
            
            function UpdateOptionsHidden(){
                let options = dataSourceAspect.getOptions();
                for(let i = 0; i<options.length; i++){
                    UpdateOptionHidden(i)
                }
            }
        
            api.UpdateOptionsHidden = () => UpdateOptionsHidden();
            api.UpdateOptionHidden = (key) => UpdateOptionHidden(key);
        
            var origСreateChoice = optionAspect.createChoice;
        
            optionAspect.createChoice = (option) => {
                let choice = origСreateChoice(option);
                choice.isOptionHidden = getIsOptionHidden(option);
                return choice;
            };
        }
    }
}

function updateHiddenChoice(choice, updateHidden , getIsOptionHidden){
    let newIsOptionHidden = getIsOptionHidden(choice.option);
    if (newIsOptionHidden != choice.isOptionHidden)
    {
        choice.isOptionHidden= newIsOptionHidden;
        updateHidden(choice)
    }
}

function getNextNonHidden(choice) { // TODO get next visible
    let next = choice.itemNext;
    if (!next) {
        return null;
    } else if (next.choiceElement) {
        return next;
    }
    return getNextNonHidden(next)
}