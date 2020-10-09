const toolButtons = [{
        sel: '#tool_select',
        fn: clickSelect,
        evt: 'click',
        key: ['V', true]
    },
    {
        sel: '#tool_fhpath',
        fn: clickFHPath,
        evt: 'click',
        key: ['Q', true]
    },
    {
        sel: '#tool_line',
        fn: clickLine,
        evt: 'click',
        key: ['L', true],
        parent: '#tools_line',
        prepend: true
    },
    {
        sel: '#tool_rect',
        fn: clickRect,
        evt: 'mouseup',
        key: ['R', true],
        parent: '#tools_rect',
        icon: 'rect'
    },
    {
        sel: '#tool_square',
        fn: clickSquare,
        evt: 'mouseup',
        parent: '#tools_rect',
        icon: 'square'
    },
    {
        sel: '#tool_fhrect',
        fn: clickFHRect,
        evt: 'mouseup',
        parent: '#tools_rect',
        icon: 'fh_rect'
    },
    {
        sel: '#tool_ellipse',
        fn: clickEllipse,
        evt: 'mouseup',
        key: ['E', true],
        parent: '#tools_ellipse',
        icon: 'ellipse'
    },
    {
        sel: '#tool_circle',
        fn: clickCircle,
        evt: 'mouseup',
        parent: '#tools_ellipse',
        icon: 'circle'
    },
    {
        sel: '#tool_fhellipse',
        fn: clickFHEllipse,
        evt: 'mouseup',
        parent: '#tools_ellipse',
        icon: 'fh_ellipse'
    },
    {
        sel: '#tool_path',
        fn: clickPath,
        evt: 'click',
        key: ['P', true]
    },
    {
        sel: '#tool_text',
        fn: clickText,
        evt: 'click',
        key: ['T', true]
    },
    {
        sel: '#tool_image',
        fn: clickImage,
        evt: 'mouseup'
    },
    {
        sel: '#tool_zoom',
        fn: clickZoom,
        evt: 'mouseup',
        key: ['Z', true]
    },
    {
        sel: '#tool_clear',
        fn: clickClear,
        evt: 'mouseup',
        key: ['N', true]
    },
    {
        sel: '#tool_save',
        fn() {
            if (editingsource) {
                saveSourceEditor();
            } else {
                clickSave();
            }
        },
        evt: 'mouseup',
        key: ['S', true]
    },
    {
        sel: '#tool_export',
        fn: clickExport,
        evt: 'mouseup'
    },
    {
        sel: '#tool_open',
        fn: clickOpen,
        evt: 'mouseup',
        key: ['O', true]
    },
    {
        sel: '#tool_import',
        fn: clickImport,
        evt: 'mouseup'
    },
    {
        sel: '#tool_source',
        fn: showSourceEditor,
        evt: 'click',
        key: ['U', true]
    },
    {
        sel: '#tool_wireframe',
        fn: clickWireframe,
        evt: 'click',
        key: ['F', true]
    },
    {
        key: ['esc', false, false],
        fn() {
            if (dialogSelectors.every((sel) => {
                    return $(sel + ':hidden').length;
                })) {
                svgCanvas.clearSelection();
            }
        },
        hidekey: true
    },
    {
        sel: dialogSelectors.join(','),
        fn: cancelOverlays,
        evt: 'click',
        key: ['esc', false, false],
        hidekey: true
    },
    {
        sel: '#tool_source_save',
        fn: saveSourceEditor,
        evt: 'click'
    },
    {
        sel: '#tool_docprops_save',
        fn: saveDocProperties,
        evt: 'click'
    },
    {
        sel: '#tool_docprops',
        fn: showDocProperties,
        evt: 'click'
    },
    {
        sel: '#tool_prefs_save',
        fn: savePreferences,
        evt: 'click'
    },
    {
        sel: '#tool_editor_prefs',
        fn: showPreferences,
        evt: 'click'
    },
    {
        sel: '#tool_editor_homepage',
        fn: openHomePage,
        evt: 'click'
    },
    {
        sel: '#tool_open',
        fn() {
            window.dispatchEvent(new CustomEvent('openImage'));
        },
        evt: 'click'
    },
    {
        sel: '#tool_import',
        fn() {
            window.dispatchEvent(new CustomEvent('importImage'));
        },
        evt: 'click'
    },
    {
        sel: '#tool_delete,#tool_delete_multi',
        fn: deleteSelected,
        evt: 'click',
        key: ['del/backspace', true]
    },
    {
        sel: '#tool_reorient',
        fn: reorientPath,
        evt: 'click'
    },
    {
        sel: '#tool_node_link',
        fn: linkControlPoints,
        evt: 'click'
    },
    {
        sel: '#tool_node_clone',
        fn: clonePathNode,
        evt: 'click'
    },
    {
        sel: '#tool_node_delete',
        fn: deletePathNode,
        evt: 'click'
    },
    {
        sel: '#tool_openclose_path',
        fn: opencloseSubPath,
        evt: 'click'
    },
    {
        sel: '#tool_add_subpath',
        fn: addSubPath,
        evt: 'click'
    },
    {
        sel: '#tool_move_top',
        fn: moveToTopSelected,
        evt: 'click',
        key: 'ctrl+shift+]'
    },
    {
        sel: '#tool_move_bottom',
        fn: moveToBottomSelected,
        evt: 'click',
        key: 'ctrl+shift+['
    },
    {
        sel: '#tool_topath',
        fn: convertToPath,
        evt: 'click'
    },
    {
        sel: '#tool_make_link,#tool_make_link_multi',
        fn: makeHyperlink,
        evt: 'click'
    },
    {
        sel: '#tool_undo',
        fn: clickUndo,
        evt: 'click'
    },
    {
        sel: '#tool_redo',
        fn: clickRedo,
        evt: 'click'
    },
    {
        sel: '#tool_clone,#tool_clone_multi',
        fn: clickClone,
        evt: 'click',
        key: ['D', true]
    },
    {
        sel: '#tool_group_elements',
        fn: clickGroup,
        evt: 'click',
        key: ['G', true]
    },
    {
        sel: '#tool_ungroup',
        fn: clickGroup,
        evt: 'click'
    },
    {
        sel: '#tool_unlink_use',
        fn: clickGroup,
        evt: 'click'
    },
    {
        sel: '[id^=tool_align]',
        fn: clickAlign,
        evt: 'click'
    },
    // these two lines are required to make Opera work properly with the flyout mechanism
    // {sel: '#tools_rect_show', fn: clickRect, evt: 'click'},
    // {sel: '#tools_ellipse_show', fn: clickEllipse, evt: 'click'},
    {
        sel: '#tool_bold',
        fn: clickBold,
        evt: 'mousedown'
    },
    {
        sel: '#tool_italic',
        fn: clickItalic,
        evt: 'mousedown'
    },
    {
        sel: '#sidepanel_handle',
        fn: toggleSidePanel,
        key: ['X']
    },
    {
        sel: '#copy_save_done',
        fn: cancelOverlays,
        evt: 'click'
    },

    // Shortcuts not associated with buttons

    {
        key: 'ctrl+left',
        fn() {
            rotateSelected(0, 1);
        }
    },
    {
        key: 'ctrl+right',
        fn() {
            rotateSelected(1, 1);
        }
    },
    {
        key: 'ctrl+shift+left',
        fn() {
            rotateSelected(0, 5);
        }
    },
    {
        key: 'ctrl+shift+right',
        fn() {
            rotateSelected(1, 5);
        }
    },
    {
        key: 'shift+O',
        fn: selectPrev
    },
    {
        key: 'shift+P',
        fn: selectNext
    },
    {
        key: [modKey + 'up', true],
        fn() {
            zoomImage(2);
        }
    },
    {
        key: [modKey + 'down', true],
        fn() {
            zoomImage(0.5);
        }
    },
    {
        key: [modKey + ']', true],
        fn() {
            moveUpDownSelected('Up');
        }
    },
    {
        key: [modKey + '[', true],
        fn() {
            moveUpDownSelected('Down');
        }
    },
    {
        key: ['up', true],
        fn() {
            moveSelected(0, -1);
        }
    },
    {
        key: ['down', true],
        fn() {
            moveSelected(0, 1);
        }
    },
    {
        key: ['left', true],
        fn() {
            moveSelected(-1, 0);
        }
    },
    {
        key: ['right', true],
        fn() {
            moveSelected(1, 0);
        }
    },
    {
        key: 'shift+up',
        fn() {
            moveSelected(0, -10);
        }
    },
    {
        key: 'shift+down',
        fn() {
            moveSelected(0, 10);
        }
    },
    {
        key: 'shift+left',
        fn() {
            moveSelected(-10, 0);
        }
    },
    {
        key: 'shift+right',
        fn() {
            moveSelected(10, 0);
        }
    },
    {
        key: ['alt+up', true],
        fn() {
            svgCanvas.cloneSelectedElements(0, -1);
        }
    },
    {
        key: ['alt+down', true],
        fn() {
            svgCanvas.cloneSelectedElements(0, 1);
        }
    },
    {
        key: ['alt+left', true],
        fn() {
            svgCanvas.cloneSelectedElements(-1, 0);
        }
    },
    {
        key: ['alt+right', true],
        fn() {
            svgCanvas.cloneSelectedElements(1, 0);
        }
    },
    {
        key: ['alt+shift+up', true],
        fn() {
            svgCanvas.cloneSelectedElements(0, -10);
        }
    },
    {
        key: ['alt+shift+down', true],
        fn() {
            svgCanvas.cloneSelectedElements(0, 10);
        }
    },
    {
        key: ['alt+shift+left', true],
        fn() {
            svgCanvas.cloneSelectedElements(-10, 0);
        }
    },
    {
        key: ['alt+shift+right', true],
        fn() {
            svgCanvas.cloneSelectedElements(10, 0);
        }
    },
    {
        key: 'a',
        fn() {
            svgCanvas.selectAllInCurrentLayer();
        }
    },
    {
        key: modKey + 'a',
        fn() {
            svgCanvas.selectAllInCurrentLayer();
        }
    },

    // Standard shortcuts
    {
        key: modKey + 'z',
        fn: clickUndo
    },
    {
        key: modKey + 'shift+z',
        fn: clickRedo
    },
    {
        key: modKey + 'y',
        fn: clickRedo
    },

    {
        key: modKey + 'x',
        fn: cutSelected
    },
    {
        key: modKey + 'c',
        fn: copySelected
    },
    {
        key: modKey + 'v',
        fn: pasteInCenter
    }
];

// Tooltips not directly associated with a single function
const keyAssocs = {
    '4/Shift+4': '#tools_rect_show',
    '5/Shift+5': '#tools_ellipse_show'
};


// hotkeys('*', function (event, handler) {
//     event.preventDefault();

//     if (hotkeys.shift) {
//         //   pkeys(keys, 16);
//         //   pkeysStr(keyStr, 'shift');
//         console.log(16);
//     }
//     if (hotkeys.ctrl) {
//         //   pkeys(keys, 17);
//         //   pkeysStr(keyStr, 'ctrl');
//         console.log(17);
//     }
//     if (hotkeys.alt) {
//         //   pkeys(keys, 18);
//         //   pkeysStr(keyStr, 'alt');
//         console.log(18);
//     }
//     if (hotkeys.control) {
//         //   pkeys(keys, 17);
//         //   pkeysStr(keyStr, 'control');
//         console.log(17);
//     }
//     if (hotkeys.command) {
//         //   pkeys(keys, 91);
//         //   pkeysStr(keyStr, 'command');
//         console.log(91);
//     }

//     console.log(event.keyCode);
//     console.log(handler.key);
// });

let modKey = 'ctrl+';
let ctrlKeysCombo = modKey + 'z,';
ctrlKeysCombo +=  modKey + '+shift+z,';
ctrlKeysCombo +=  modKey + '+y,';
ctrlKeysCombo +=  modKey + '+x,';
ctrlKeysCombo +=  modKey + '+c,';
ctrlKeysCombo +=  modKey + '+v,';
ctrlKeysCombo +=  modKey + '+a,';

let shiftKeysCombo = "";
let altKeysCombo = "";
let keys = "left,right,up,down";

// // Standard shortcuts
// {key: modKey + 'z', fn: clickUndo},
// {key: modKey + 'shift+z', fn: clickRedo},
// {key: modKey + 'y', fn: clickRedo},

// {key: modKey + 'x', fn: cutSelected},
// {key: modKey + 'c', fn: copySelected},
// {key: modKey + 'v', fn: pasteInCenter}
// {key: modKey + 'a', fn () { svgCanvas.selectAllInCurrentLayer(); }},

// {key: ['up', true], fn () { moveSelected(0, -1); }},
// {key: ['down', true], fn () { moveSelected(0, 1); }},
// {key: ['left', true], fn () { moveSelected(-1, 0); }},
// {key: ['right', true], fn () { moveSelected(1, 0); }},

// {key: 'ctrl+left', fn () { rotateSelected(0, 1); }},
// {key: 'ctrl+right', fn () { rotateSelected(1, 1); }},
// {key: 'ctrl+shift+left', fn () { rotateSelected(0, 5); }},
// {key: 'ctrl+shift+right', fn () { rotateSelected(1, 5); }},

// {key: [modKey + 'up', true], fn () { zoomImage(2); }},
// {key: [modKey + 'down', true], fn () { zoomImage(0.5); }},
// {key: [modKey + ']', true], fn () { moveUpDownSelected('Up'); }},
// {key: [modKey + '[', true], fn () { moveUpDownSelected('Down'); }},

// {key: 'shift+P', fn: selectNext},
// {key: 'shift+O', fn: selectPrev},


// {key: 'shift+up', fn () { moveSelected(0, -10); }},
// {key: 'shift+down', fn () { moveSelected(0, 10); }},
// {key: 'shift+left', fn () { moveSelected(-10, 0); }},
// {key: 'shift+right', fn () { moveSelected(10, 0); }},

// {key: ['alt+up', true], fn () { svgCanvas.cloneSelectedElements(0, -1); }},
// {key: ['alt+down', true], fn () { svgCanvas.cloneSelectedElements(0, 1); }},
// {key: ['alt+left', true], fn () { svgCanvas.cloneSelectedElements(-1, 0); }},
// {key: ['alt+right', true], fn () { svgCanvas.cloneSelectedElements(1, 0); }},
// {key: ['alt+shift+up', true], fn () { svgCanvas.cloneSelectedElements(0, -10); }},
// {key: ['alt+shift+down', true], fn () { svgCanvas.cloneSelectedElements(0, 10); }},
// {key: ['alt+shift+left', true], fn () { svgCanvas.cloneSelectedElements(-10, 0); }},
// {key: ['alt+shift+right', true], fn () { svgCanvas.cloneSelectedElements(10, 0); }},

// {key: 'a', fn () { svgCanvas.selectAllInCurrentLayer(); }},