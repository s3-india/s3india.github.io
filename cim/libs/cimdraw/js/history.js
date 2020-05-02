/**
 * Group: Undo/Redo history management.
 */
/*export*/
const HistoryEventTypes = {
  BEFORE_APPLY: 'before_apply',
  AFTER_APPLY: 'after_apply',
  BEFORE_UNAPPLY: 'before_unapply',
  AFTER_UNAPPLY: 'after_unapply'
};

// const removedElements = {};

/**
 * Base class for commands.
 */
class Command {
  /**
   * @returns {string}
   */
  constructor(model) {
    this.model_ = model;
  }

  getText() {
    return this.text;
  }
}

// Todo: Figure out why the interface members aren't showing
//   up (with or without modules applied), despite our apparently following
//   http://usejsdoc.org/tags-interface.html#virtual-comments

/**
 * An interface that all command objects must implement.
 * @interface module:history.HistoryCommand
 */
/**
 * Applies.
 *
 * @function module:history.HistoryCommand#apply
 * @param {module:history.HistoryEventHandler} handler
 * @fires module:history~Command#event:history
 * @returns {void|true}
 */
/**
 *
 * Unapplies.
 * @function module:history.HistoryCommand#unapply
 * @param {module:history.HistoryEventHandler} handler
 * @fires module:history~Command#event:history
 * @returns {void|true}
 */
/**
 * Returns the elements.
 * @function module:history.HistoryCommand#elements
 * @returns {Element[]}
 */
/**
 * Gets the text.
 * @function module:history.HistoryCommand#getText
 * @returns {string}
 */
/**
 * Gives the type.
 * @function module:history.HistoryCommand.type
 * @returns {string}
 */
/**
 * Gives the type.
 * @function module:history.HistoryCommand#type
 * @returns {string}
 */

/**
 * @event module:history~Command#event:history
 * @type {module:history.HistoryCommand}
 */

/**
 * An interface for objects that will handle history events.
 * @interface module:history.HistoryEventHandler
 */
/**
 *
 * @function module:history.HistoryEventHandler#handleHistoryEvent
 * @param {string} eventType One of the HistoryEvent types
 * @param {module:history~Command#event:history} command
 * @listens module:history~Command#event:history
 * @returns {void}
 *
 */

/**
 * History command for an element that had its DOM position changed.
 * @implements {module:history.HistoryCommand}
 */
/*export*/
class MoveElementCommand extends Command {
  /**
   * @param {Element} elem - The DOM element that was moved
   * @param {Element} oldNextSibling - The element's next sibling before it was moved
   * @param {Element} oldParent - The element's parent before it was moved
   * @param {string} [text] - An optional string visible to user related to this change
   */
  constructor(model, elem, elemOldProp, elemNewProp) {
    super(model);
    if (Array.isArray(elem)) {
      this.elem = elem;
      this.elemOldProp = elemOldProp;
      this.elemNewProp = elemNewProp;
    } else {
      this.elem = [elem];
      this.elemOldProp = [elemOldProp];
      this.elemNewProp = [elemNewProp];
    }
  }
  /**
   * @returns {"svgedit.history.MoveElementCommand"}
   */
  type() { // eslint-disable-line class-methods-use-this
    return 'svgedit.history.MoveElementCommand';
  }

  /**
   * Re-positions the element.
   * @param {module:history.HistoryEventHandler} handler
   * @fires module:history~Command#event:history
   * @returns {void}
   */
  apply(handler) {
    // TODO(codedread): Refactor this common event code into a base HistoryCommand class.
    if (handler) {
      handler.handleHistoryEvent(HistoryEventTypes.BEFORE_APPLY, this);
    }

    // for(let i =0;i < this.elem.length; i++)
    // {

    //   this.elem[i].x = this.elemNewProp[i].x;
    //   this.elem[i].y = this.elemNewProp[i].y;
    //   this.elem[i].px = this.elemNewProp[i].px;
    //   this.elem[i].py = this.elemNewProp[i].py;
    //   this.elem[i].rotation = this.elemNewProp[i].rotation;
    //  // this.elem[i].lineData = this.elemNewProp[i].lineData;

    // }

    this.model_.trigger("dragObjectToView", this.elem, this.elemNewProp);

    // this.elem = this.newParent.insertBefore(this.elem, this.newNextSibling);

  }

  /**
   * Positions the element back to its original location.
   * @param {module:history.HistoryEventHandler} handler
   * @fires module:history~Command#event:history
   * @returns {void}
   */
  unapply(handler) {
    if (handler) {
      handler.handleHistoryEvent(HistoryEventTypes.BEFORE_UNAPPLY, this);
    }

    // for(let i =0;i < this.elem.length; i++)
    // {

    //   this.elem[i].x = this.elemOldProp[i].x;
    //   this.elem[i].y = this.elemOldProp[i].y;
    //   this.elem[i].px = this.elemOldProp[i].px;
    //   this.elem[i].py = this.elemOldProp[i].py;
    //   this.elem[i].rotation = this.elemOldProp[i].rotation;
    //   //this.elem[i].lineData = this.elemOldProp[i].lineData;


    // }

    this.model_.trigger("dragObjectToView", this.elem, this.elemOldProp);

    // this.elem = this.oldParent.insertBefore(this.elem, this.oldNextSibling);

  }

  /**
   * @returns {Element[]} Array with element associated with this command
   */
  elements() {
    return this.elem;
  }
}
MoveElementCommand.type = MoveElementCommand.prototype.type;

/**
 * History command for an element that was added to the DOM.
 * @implements {module:history.HistoryCommand}
 */
/*export*/
class InsertElementCommand extends Command {
  /**
   * @param {Element} elem - The newly added DOM element
   * @param {string} text - An optional string visible to user related to this change
   */
  constructor(model, elem) {
    super(model);
    if (Array.isArray(elem)) {
      this.elem = elem;
    } else {
      this.elem = [elem];
    }
    this.elemProps = [];

    for (let i = 0; i < this.elem.length; i++) {

      let objInfo = {};

      let uuid = this.model_.getObjectUUID(this.elem[i]);

      objInfo["uuid"] = uuid;

      let allTerminals = this.model_.getTerminals([this.elem[i]]);
      for (let j = 0; j < allTerminals.length; j++) {
        let term = allTerminals[j];

        let id = term.attributes.getNamedItem("rdf:ID");
        if (id === null) {
          id = term.attributes.getNamedItem("rdf:about");
        }
        if (id === null) {
          continue;
        }
        let idValue = id.value;
        if (idValue.startsWith("#")) {
          idValue = idValue.substring(1);
        }

        if (j == 0) {
          objInfo["term1.uuid"] = idValue;
        }

        if (j == 1) {
          objInfo["term2.uuid"] = idValue;
        }

        if (j == 2) {
          objInfo["term3.uuid"] = idValue;
        }
      }

      if (this.elem[i].nodeName === "cim:ConnectivityNode") {
        objInfo["connectivityNodeTerminalsUUID"] = [];
        let terminals = this.model_.getTargets([this.elem[i]], "ConnectivityNode.Terminals");
        for (let k = 0; k < terminals.length; k++) {
          let uuid = this.model_.getObjectUUID(terminals[k]);
          objInfo["connectivityNodeTerminalsUUID"].push(uuid);
        }

      }
      if (this.elem[i].nodeName === "cim:ACLineSegment" || this.elem[i].nodeName == "cim:BusbarSection" ||
      this.elem[i].nodeName === "cim:ConnectivityNode") {
        objInfo["lineData"] = JSON.parse(JSON.stringify(this.elem[i].lineData));
      }

      this.elemProps.push(objInfo);
      //this.elem[i]._objInfo = objInfo;
    }
  }

  /**
   * @returns {"svgedit.history.InsertElementCommand"}
   */
  type() { // eslint-disable-line class-methods-use-this
    return 'svgedit.history.InsertElementCommand';
  }

  /**
   * Re-inserts the new element.
   * @param {module:history.HistoryEventHandler} handler
   * @fires module:history~Command#event:history
   * @returns {void}
   */
  apply(handler) {
    if (handler) {
      handler.handleHistoryEvent(HistoryEventTypes.BEFORE_APPLY, this);
    }

    //this.elem = this.parent.insertBefore(this.elem, this.nextSibling);
    this.model_.insertElements(this.elem, this.elemProps);

  }

  /**
   * Removes the element.
   * @param {module:history.HistoryEventHandler} handler
   * @fires module:history~Command#event:history
   * @returns {void}
   */
  unapply(handler) {
    if (handler) {
      handler.handleHistoryEvent(HistoryEventTypes.BEFORE_UNAPPLY, this);
    }

    // this.parent = this.elem.parentNode;
    // this.elem = this.elem.parentNode.removeChild(this.elem);
    this.model_.trigger("deleteObjectFromView", (this.elem));
    // this.model_.deleteObjects(this.elem);
  }

  /**
   * @returns {Element[]} Array with element associated with this command
   */
  elements() {
    return this.elem;
  }
}
InsertElementCommand.type = InsertElementCommand.prototype.type;

/**
 * History command for an element removed from the DOM.
 * @implements {module:history.HistoryCommand}
 */
/*export*/
class RemoveElementCommand extends Command {

  /**
   * @param {Element} elem - The removed DOM element
   * @param {Node} oldNextSibling - The DOM element's nextSibling when it was in the DOM
   * @param {Element} oldParent - The DOM element's parent
   * @param {string} [text] - An optional string visible to user related to this change
   */
  constructor(model, elem, oldNextSibling, oldParent) {
    super(model);
    if (Array.isArray(elem)) {
      this.elem = elem;
    } else {
      this.elem = [elem];
    }
    this.elemProps = [];
    this.nextSibling = oldNextSibling;
    this.parent = oldParent;

    for (let i = 0; i < this.elem.length; i++) {

      let objInfo = {};

      let uuid = this.model_.getObjectUUID(this.elem[i]);

      objInfo["uuid"] = uuid;

      let allTerminals = this.model_.getTerminals([this.elem[i]]);
      for (let j = 0; j < allTerminals.length; j++) {
        let term = allTerminals[j];

        let id = term.attributes.getNamedItem("rdf:ID");
        if (id === null) {
          id = term.attributes.getNamedItem("rdf:about");
        }
        if (id === null) {
          continue;
        }
        let idValue = id.value;
        if (idValue.startsWith("#")) {
          idValue = idValue.substring(1);
        }

        if (j == 0) {
          objInfo["term1.uuid"] = idValue;
        }

        if (j == 1) {
          objInfo["term2.uuid"] = idValue;
        }

        if (j == 2) {
          objInfo["term3.uuid"] = idValue;
        }
      }

      if (this.elem[i].nodeName === "cim:ConnectivityNode") {
        objInfo["connectivityNodeTerminalsUUID"] = [];
        let terminals = this.model_.getTargets([this.elem[i]], "ConnectivityNode.Terminals");
        for (let k = 0; k < terminals.length; k++) {
          let uuid = this.model_.getObjectUUID(terminals[k]);
          objInfo["connectivityNodeTerminalsUUID"].push(uuid);
        }

      }
      if (this.elem[i].nodeName === "cim:ACLineSegment" || this.elem[i].nodeName == "cim:BusbarSection" ||
         this.elem[i].nodeName === "cim:ConnectivityNode") {
        objInfo["lineData"] = JSON.parse(JSON.stringify(this.elem[i].lineData));
      }

      this.elemProps.push(objInfo);
      //this.elem[i]._objInfo = objInfo;
    }
  }

  /**
   * @returns {"svgedit.history.RemoveElementCommand"}
   */
  type() { // eslint-disable-line class-methods-use-this
    return 'svgedit.history.RemoveElementCommand';
  }

  /**
   * Re-removes the new element.
   * @param {module:history.HistoryEventHandler} handler
   * @fires module:history~Command#event:history
   * @returns {void}
   */
  apply(handler) {
    if (handler) {
      handler.handleHistoryEvent(HistoryEventTypes.BEFORE_APPLY, this);
    }
    //this.elem = this.parent.removeChild(this.elem);
    //this.model_.deleteObjects(this.elem);
    this.model_.trigger("deleteObjectFromView", (this.elem));

  }

  /**
   * Re-adds the new element.
   * @param {module:history.HistoryEventHandler} handler
   * @fires module:history~Command#event:history
   * @returns {void}
   */
  unapply(handler) {
    if (handler) {
      handler.handleHistoryEvent(HistoryEventTypes.BEFORE_UNAPPLY, this);
    }

    //this.parent.insertBefore(this.elem, this.nextSibling); // Don't use `before` or `prepend` as `this.nextSibling` may be `null`

    this.model_.insertElements(this.elem, this.elemProps);

    // for (let i = 0; i < this.elem.length; i++) {
    //   this.model_.trigger("addToDiagram", this.elem[i]);
    // }
    //this.parent.insertBefore(this.elem, this.nextSibling); 
  }

  /**
   * @returns {Element[]} Array with element associated with this command
   */
  elements() {
    return this.elem;
  }
}
RemoveElementCommand.type = RemoveElementCommand.prototype.type;

/**
 * @typedef {"#text"|"#href"|string} module:history.CommandAttributeName
 */
/**
 * @typedef {PlainObject<module:history.CommandAttributeName, string>} module:history.CommandAttributes
 */

/**
 * History command to make a change to an element.
 * Usually an attribute change, but can also be textcontent.
 * @implements {module:history.HistoryCommand}
 */
/*export*/
class ChangeElementCommand extends Command {
  /**
   * @param {Element} elem - The DOM element that was changed
   * @param {module:history.CommandAttributes} attrs - Attributes to be changed with the values they had *before* the change
   * @param {string} text - An optional string visible to user related to this change
   */
  constructor(model, elem, attrs, text) {
    super(model);
    if (Array.isArray(elem)) {
      this.elem = elem;
    } else {
      this.elem = [elem];
    }
    this.text = text ? ('Change ' + elem.tagName + ' ' + text) : ('Change ' + elem.tagName);
    this.newValues = {};
    this.oldValues = attrs;

  }
  /**
   * @returns {"svgedit.history.ChangeElementCommand"}
   */
  type() { // eslint-disable-line class-methods-use-this
    return 'svgedit.history.ChangeElementCommand';
  }

  /**
   * Performs the stored change action.
   * @param {module:history.HistoryEventHandler} handler
   * @fires module:history~Command#event:history
   * @returns {true}
   */
  apply(handler) {
    if (handler) {
      handler.handleHistoryEvent(HistoryEventTypes.BEFORE_APPLY, this);
    }


    return true;
  }

  /**
   * Reverses the stored change action.
   * @param {module:history.HistoryEventHandler} handler
   * @fires module:history~Command#event:history
   * @returns {true}
   */
  unapply(handler) {
    if (handler) {
      handler.handleHistoryEvent(HistoryEventTypes.BEFORE_UNAPPLY, this);
    }

  }

  /**
   * @returns {Element[]} Array with element associated with this command
   */
  elements() {
    return this.elem;
  }
}
ChangeElementCommand.type = ChangeElementCommand.prototype.type;

// TODO: create a 'typing' command object that tracks changes in text
// if a new Typing command is created and the top command on the stack is also a Typing
// and they both affect the same element, then collapse the two commands into one

/**
 * History command that can contain/execute multiple other commands.
 * @implements {module:history.HistoryCommand}
 */
/*export*/
class BatchCommand extends Command {
  /**
   * @param {string} [text] - An optional string visible to user related to this change
   */
  constructor(model, text) {
    super(model);
    this.text = text || 'Batch Command';
    this.stack = [];
  }

  /**
   * @returns {"svgedit.history.BatchCommand"}
   */
  type() { // eslint-disable-line class-methods-use-this
    return 'svgedit.history.BatchCommand';
  }

  /**
   * Runs "apply" on all subcommands.
   * @param {module:history.HistoryEventHandler} handler
   * @fires module:history~Command#event:history
   * @returns {void}
   */
  apply(handler) {
    if (handler) {
      handler.handleHistoryEvent(HistoryEventTypes.BEFORE_APPLY, this);
    }

    const len = this.stack.length;
    for (let i = 0; i < len; ++i) {
      this.stack[i].apply(handler);
    }

    if (handler) {
      handler.handleHistoryEvent(HistoryEventTypes.AFTER_APPLY, this);
    }
  }

  /**
   * Runs "unapply" on all subcommands.
   * @param {module:history.HistoryEventHandler} handler
   * @fires module:history~Command#event:history
   * @returns {void}
   */
  unapply(handler) {
    if (handler) {
      handler.handleHistoryEvent(HistoryEventTypes.BEFORE_UNAPPLY, this);
    }

    for (let i = this.stack.length - 1; i >= 0; i--) {
      this.stack[i].unapply(handler);
    }

    if (handler) {
      handler.handleHistoryEvent(HistoryEventTypes.AFTER_UNAPPLY, this);
    }
  }

  /**
   * Iterate through all our subcommands.
   * @returns {Element[]} All the elements we are changing
   */
  elements() {
    const elems = [];
    let cmd = this.stack.length;
    while (cmd--) {
      const thisElems = this.stack[cmd].elements();
      let elem = thisElems.length;
      while (elem--) {
        if (!elems.includes(thisElems[elem])) {
          elems.push(thisElems[elem]);
        }
      }
    }
    return elems;
  }

  /**
   * Adds a given command to the history stack.
   * @param {Command} cmd - The undo command object to add
   * @returns {void}
   */
  addSubCommand(cmd) {
    this.stack.push(cmd);
  }

  /**
   * @returns {boolean} Indicates whether or not the batch command is empty
   */
  isEmpty() {
    return !this.stack.length;
  }
}
BatchCommand.type = BatchCommand.prototype.type;

/**
 *
 */
/*export*/
class UndoManager {
  /**
   * @param {module:history.HistoryEventHandler} historyEventHandler
   */
  constructor(historyEventHandler) {
    this.handler_ = historyEventHandler || null;
    this.undoStackPointer = 0;
    this.undoStack = [];

    // this is the stack that stores the original values, the elements and
    // the attribute name for begin/finish
    this.undoChangeStackPointer = -1;
    this.undoableChangeStack = [];
  }

  /**
   * Resets the undo stack, effectively clearing the undo/redo history.
   * @returns {void}
   */
  resetUndoStack() {
    this.undoStack = [];
    this.undoStackPointer = 0;
  }

  /**
   * @returns {Integer} Current size of the undo history stack
   */
  getUndoStackSize() {
    return this.undoStackPointer;
  }

  /**
   * @returns {Integer} Current size of the redo history stack
   */
  getRedoStackSize() {
    return this.undoStack.length - this.undoStackPointer;
  }

  /**
   * @returns {string} String associated with the next undo command
   */
  getNextUndoCommandText() {
    return this.undoStackPointer > 0 ? this.undoStack[this.undoStackPointer - 1].getText() : '';
  }

  /**
   * @returns {string} String associated with the next redo command
   */
  getNextRedoCommandText() {
    return this.undoStackPointer < this.undoStack.length ? this.undoStack[this.undoStackPointer].getText() : '';
  }

  /**
   * Performs an undo step.
   * @returns {void}
   */
  undo() {
    if (this.undoStackPointer > 0) {
      const cmd = this.undoStack[--this.undoStackPointer];
      cmd.unapply(this.handler_);
    }
  }

  /**
   * Performs a redo step.
   * @returns {void}
   */
  redo() {
    if (this.undoStackPointer < this.undoStack.length && this.undoStack.length > 0) {
      const cmd = this.undoStack[this.undoStackPointer++];
      cmd.apply(this.handler_);
    }
  }

  /**
   * Adds a command object to the undo history stack.
   * @param {Command} cmd - The command object to add
   * @returns {void}
   */
  addCommandToHistory(cmd) {
    // TODO: we MUST compress consecutive text changes to the same element
    // (right now each keystroke is saved as a separate command that includes the
    // entire text contents of the text element)
    // TODO: consider limiting the history that we store here (need to do some slicing)

    // if our stack pointer is not at the end, then we have to remove
    // all commands after the pointer and insert the new command
    if (this.undoStackPointer < this.undoStack.length && this.undoStack.length > 0) {
      this.undoStack = this.undoStack.splice(0, this.undoStackPointer);
    }
    this.undoStack.push(cmd);
    this.undoStackPointer = this.undoStack.length;
  }

  /**
   * This function tells the canvas to remember the old values of the
   * `attrName` attribute for each element sent in.  The elements and values
   * are stored on a stack, so the next call to `finishUndoableChange()` will
   * pop the elements and old values off the stack, gets the current values
   * from the DOM and uses all of these to construct the undo-able command.
   * @param {string} attrName - The name of the attribute being changed
   * @param {Element[]} elems - Array of DOM elements being changed
   * @returns {void}
   */
  beginUndoableChange(attrName, elems) {
    const p = ++this.undoChangeStackPointer;
    let i = elems.length;
    const oldValues = new Array(i),
      elements = new Array(i);
    while (i--) {
      const elem = elems[i];
      if (isNullish(elem)) {
        continue;
      }
      elements[i] = elem;
      oldValues[i] = elem.getAttribute(attrName);
    }
    this.undoableChangeStack[p] = {
      attrName,
      oldValues,
      elements
    };
  }

  /**
   * This function returns a `BatchCommand` object which summarizes the
   * change since `beginUndoableChange` was called.  The command can then
   * be added to the command history.
   * @returns {BatchCommand} Batch command object with resulting changes
   */
  finishUndoableChange() {
    const p = this.undoChangeStackPointer--;
    const changeset = this.undoableChangeStack[p];
    const {
      attrName
    } = changeset;
    const batchCmd = new BatchCommand('Change ' + attrName);
    let i = changeset.elements.length;
    while (i--) {
      const elem = changeset.elements[i];
      if (isNullish(elem)) {
        continue;
      }
      const changes = {};
      changes[attrName] = changeset.oldValues[i];
      if (changes[attrName] !== elem.getAttribute(attrName)) {
        batchCmd.addSubCommand(new ChangeElementCommand(elem, changes, attrName));
      }
    }
    this.undoableChangeStack[p] = null;
    return batchCmd;
  }
}