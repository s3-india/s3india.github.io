/*
 This tag renders a tree view of a given CIM diagram.

 Copyright 2017-2019 Daniele Pala <pala.daniele@gmail.com>

 This file is part of CIMDraw.

 CIMDraw is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 CIMDraw is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with CIMDraw. If not, see <http://www.gnu.org/licenses/>.
*/

<cimTree>
    <style>
     .tree {
           resize: horizontal;
        /* display: flex;
         flex-flow: column;
         max-height: 800px;
         min-width: 500px;
         resize: horizontal;
         padding-top: 10px;
         overflow: auto;*/
     }

     .tab-content {
         /*overflow: scroll;*/
     }

     .cim-tree-attribute-name {
         text-align: left;
       /*  min-width: 200px;*/
         min-width: 140px;
        font-size: 0.9rem;
        line-height: 1;
        padding: 5px 2px;
     }

     .cim-tree-attribute-uom {
         /*width: 70px;*/
        width: 40px;
        font-size: 0.9rem;
        line-height: 1;
        padding: 5px 2px;
     }
     
     .cim-tree-btn-group {
         /*flex-grow: 1;*/
     }

     .cim-tree-dropdown-toggle {
        /* flex-grow: 1;*/
        padding: 5px 5px;
     }

     ul {
         list-style-type: none;
         padding:0px 0px 0px 0px;
     }

     #tree-link-dialog {
         max-width: 18rem;
         align-self: center;
         min-width: 95%;
         min-height: min-content;
     }

     #tree-link-dialog > .card-body {
         text-align: center;
     }
     
     #tree-controls {
         padding-bottom: 10px;
         align-self: center;
         flex-shrink: 0;
     }

     #cim-search-form {
         align-self: center;
         max-width: 600px;
         padding-right: 20px;
         padding-left: 20px;
         padding-bottom: 10px;
     }

    /*.list-group {
        display: flex;
        flex-direction: column;
        padding-left: 0;
        padding-top: 4px;
        margin-bottom: 0
     }*/

    .list-group-item {
        position: relative;
        display: block;
        /*padding: 0.1rem 0.1rem;*/
        padding-top:0.5rem;
        padding-left:0.2rem;
        padding-bottom:0.5rem;
        padding-right:0.1rem;
        margin-bottom: -4px;
        background-color: #fff;
        border: 1px solid rgba(0, 0, 0, 0.125);
     }
     .list-group-item > div {
         width: 100%;
     }

     .cim-tree-btn-group > .cimLinkBtn {
         /*flex-grow: 1;*/
         padding: 5px 5px;
     }

     .tree > .nav-tabs {
         flex-shrink: 0;
     }

     .cim-expand-object {
         border: transparent;
     }

     .cim-expand-object:focus {
         box-shadow: initial;
     }

     .cim-expand-object:hover {
         color: #6c757d;
         background-color: transparent;
     }
    </style>

    <!--  <div class="app-tree" id="app-tree">
        <div class="tree">
            <div class="card bg-light mb-3 d-none" id="tree-link-dialog">
                <div class="card-body">
                    <h5 class="card-title">Choose the target element</h5>
                    <p class="card-text">Click on the selection box to select it.</p>
                    <button type="button" class="btn btn-outline-danger" id="tree-link-dialog-cancel">Cancel</button>
                </div>
            </div>
            <div class="btn-group-toggle" data-toggle="buttons" id="tree-controls">
                <label class="btn btn-primary">
                    <input type="checkbox" autocomplete="off" id="showAllObjects"> Show all objects
                </label>
                <label class="btn btn-primary">
                    <input type="checkbox" autocomplete="off" id="sshInput">Power flow input
                </label>
             </div>

             <div class="input-group" id="cim-search-form">
                 <input type="text" class="form-control" placeholder="Search..." aria-label="Search" aria-describedby="button-addon4" id="cim-search-key">
                 <div class="input-group-append" id="button-addon4">
                     <button class="btn btn-outline-secondary" id="cim-search-prev" type="button" title="Find previous">
                         <span class="fas fa-angle-up"></span>
                     </button>
                     <button class="btn btn-outline-secondary" id="cim-search-next" type="button" title="Find next">
                         <span class="fas fa-angle-down"></span>
                     </button>
                 </div>
                 <div class="input-group-append">
                     <button class="btn btn-outline-secondary" type="button" id="cim-search-case" data-toggle="button" aria-pressed="false" autocomplete="off">Match case</button>
                 </div>
                 <div class="input-group-append d-none" id="cim-search-results">
                     <span class="input-group-text" id="basic-addon2"></span>
                 </div>
             </div>
         
            <ul class="nav nav-tabs" role="tablist">
                <li class="nav-item"><a class="nav-link active" data-toggle="tab" href="#components" id="componentsTab">Components</a></li>
                <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#containers" id="containersTab">Containers</a></li>
                <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#measurements" id="measurementsTab">Measurements</a></li>
                <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#bases" id="basesTab">Bases</a></li>
                <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#curvesAndRegs" id="curvesAndRegsTab">Curves and Regulations</a></li>
                <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#limits" id="limitsTab">Operational Limits</a></li>
            </ul>
            <div class="tab-content">
                <div role="tabpanel" class="tab-pane fade show active" id="components">
                    <ul class="list-group" id="CIMComponents"></ul>
                </div>
                <div role="tabpanel" class="tab-pane fade" id="containers">
                    <ul class="list-group" id="CIMContainers"></ul>
                </div>
                <div role="tabpanel" class="tab-pane fade" id="measurements">
                    <ul class="list-group" id="CIMMeasurements"></ul>
                </div>
                <div role="tabpanel" class="tab-pane fade" id="bases">
                    <ul class="list-group" id="CIMBases"></ul>
                </div>
                <div role="tabpanel" class="tab-pane fade" id="curvesAndRegs">
                    <ul class="list-group" id="CIMCurvesAndRegs"></ul>
                </div>
                <div role="tabpanel" class="tab-pane fade" id="limits">
                    <ul class="list-group" id="CIMLimits"></ul>
                </div>
            </div>
            
        </div>
    </div>    -->
    
    <div  class="app-tree"  id="app-tree">
        <div class="tree component-properties" id="right-panel" style="overflow-y:scroll">
            <div class="card bg-light mb-3 d-none" id="tree-link-dialog">
                <div class="card-body">
                    <h5 class="card-title">Choose the target element</h5>
                    <p class="card-text">Click on the selection box to select it.</p>
                    <button type="button" class="btn btn-outline-danger" id="tree-link-dialog-cancel">Cancel</button>
                </div>
            </div>
            <div class="btn-group-toggle text-center" data-toggle="buttons" id="tree-controls">
                <label class="btn btn-primary btn-sm">
                    <input type="checkbox" autocomplete="off" id="showAllObjects"> Show all objects
                </label>
                <label class="btn btn-primary btn-sm" id="tree-control-power-flow-input" style="display:none">
                    <input type="checkbox" autocomplete="off" id="sshInput">Power flow input
                </label>
             </div>

             <!--  <div class="input-group" id="cim-search-form">  -->
             <div class="input-group" id="cim-search-form">
                 <input type="text" class="form-control" placeholder="Search..." aria-label="Search" aria-describedby="button-addon4" id="cim-search-key">
                 <div class="input-group-append" id="button-addon4">
                     <button class="btn btn-outline-secondary btn-sm" id="cim-search-prev" type="button" title="Find previous">
                         <span class="fas fa-angle-up"></span>
                     </button>
                     <button class="btn btn-outline-secondary btn-sm" id="cim-search-next" type="button" title="Find next">
                         <span class="fas fa-angle-down"></span>
                     </button>
                 </div>
                 <div class="input-group-append">
                     <button class="btn btn-outline-secondary btn-sm" type="button" id="cim-search-case" data-toggle="button" aria-pressed="false" autocomplete="off">Match case</button>
                 </div>
                 <div class="input-group-append d-none" id="cim-search-results">
                     <span class="input-group-text" id="basic-addon2"></span>
                 </div>
             </div>
            <ul class="nav nav-tabs nav-fill" role="tablist">
                <li class="nav-item">
                    <a class="nav-link active" data-toggle="tab" href="#components" id="componentsTab">
                        <i class="la la-lg la-cube"></i>
                        <div><span>Components</span></div>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-toggle="tab" href="#containers" id="containersTab">
                        <i class="la la-lg la-cube"></i>
                        <div><span>Containers</span></div>
                    </a>
                    </a>
                </li>
                <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#measurements" id="measurementsTab">
                    <i class="la la-lg la-cube"></i>
                    <div><span>Measurements</span></div>
                </a></li>
                <li class="nav-item">
                    <a class="nav-link" data-toggle="tab" href="#bases" id="basesTab">
                        <i class="la la-lg la-cube"></i>
                        <div><span>Bases</span></div>
                    </a>
                </li>
                <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#curvesAndRegs" id="curvesAndRegsTab">
                    <i class="la la-lg la-cube"></i>
                    <div><span>Curves and Regulations</span></div>
                </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-toggle="tab" href="#limits" id="limitsTab">
                        <i class="la la-lg la-cube"></i>
                        <div><span>Operational Limits</span></div>
                    </a>
                </li>
            </ul>

             <div class="tab-content">
                <div role="tabpanel" class="tab-pane fade show active" id="components">
                    <ul class="list-group" id="CIMComponents"></ul>
                </div>
                <div role="tabpanel" class="tab-pane fade" id="containers">
                    <ul class="list-group" id="CIMContainers"></ul>
                </div>
                <div role="tabpanel" class="tab-pane fade" id="measurements">
                    <ul class="list-group" id="CIMMeasurements"></ul>
                </div>
                <div role="tabpanel" class="tab-pane fade" id="bases">
                    <ul class="list-group" id="CIMBases"></ul>
                </div>
                <div role="tabpanel" class="tab-pane fade" id="curvesAndRegs">
                    <ul class="list-group" id="CIMCurvesAndRegs"></ul>
                </div>
                <div role="tabpanel" class="tab-pane fade" id="limits">
                    <ul class="list-group" id="CIMLimits"></ul>
                </div>
            </div>
        </div>
    </div>

    <div id="bottom-panel">

        <div class="btn-group" role="group">

            <button id="output-editor-btn" data-view="mobile" class="btn btn-sm btn-light btn-sm" title="Output">
                <i class="la la-code"></i> Output
            </button>

            <div id="toggleOutputEditorJsExecute" class="custom-control custom-checkbox mt-1" style="display:none">
                <!--  <input type="checkbox" class="custom-control-input" id="customCheck" name="example1">  -->

                <!--  <label class="custom-control-label" for="customCheck"><small>Run javascript code on
                        edit</small></label>  -->
            </div>
        </div>

        <div id="vvveb-code-editor">
            <textarea class="form-control"></textarea>
            <div>

            </div>
        </div>
    </div>

    <script>cimTreeTag.call(this, this.opts);</script>
    
</cimTree>
