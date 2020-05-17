/*
 This tag renders the whole CIMDraw application, handling routing logic.

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

<cimDraw>
    <style>
     .center-block {
         text-align: center;
     }
     
     .diagramTools {
         margin-bottom: 20px;
     }
     
     .app-container {
         display: flex;
         flex-flow: row nowrap;
     }

     .navbar-light .navbar-text {
         color: rgba(0,0,0,1);
     }

     .navbar-light .navbar-nav .nav-link {
         color: rgba(0,0,0,1);
     }

     .cim-content-center {
         text-align: center;
         max-width: 700px;
     }

     #upload-boundary {
         display: none;
     }
    </style>

    <div class="container-fluid">
        <div class="row">
            <div class="app-container /* col-md-12*/" id="app-container">
            
                <cimDiagram model={cimModel}></cimDiagram>
                <cimTree model={cimModel}></cimTree> 
                 
            </div>
        
        </div>

        <!-- Modal for loading a specific diagram -->
        <div class="modal fade" id="newDiagramModal" tabindex="-1" role="dialog" aria-labelledby="newDiagramModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="newDiagramModalLabel">Enter a name for the new diagram</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        
                    </div>
                    <div class="modal-body">
                        <form>
                            <input type="text" class="form-control" id="newDiagramName" placeholder="untitled">
                        </form> 
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" id="newDiagramBtn">Create</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal for loading diagram list -->
        <div class="modal fade" id="loadingModal" tabindex="-1" role="dialog" aria-labelledby="loadingDiagramModalLabel" data-backdrop="static">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-body">
                        <p id="loadingDiagramMsg">loading diagram...</p>
                    </div>
                    <div class="modal-footer" id="cim-loading-modal-error-container">
                        <button type="button" class="btn btn-primary" id="cim-loading-modal-error">Ok</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal for loading boundary file -->
        <div class="modal fade" id="boundaryModal" tabindex="-1" role="dialog" aria-labelledby="boundaryModalLabel" data-backdrop="static">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-body">
                        <p id="boundaryMsg">loading boundary file...</p>
                    </div>
                    <div class="modal-footer" id="cim-boundary-modal-error-container">
                        <button type="button" class="btn btn-primary" id="cim-boundary-modal-error">Ok</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal for selecting the modeling type: bus-branch vs node-breaker -->
        <div class="modal fade" id="cimModeModal" tabindex="-1" role="dialog" aria-labelledby="cimModeModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="cimModeModalLabel">Choose diagram type</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    </div>
                    <div class="modal-body">
                        <div class="row justify-content-center">
                            <div class="col-md-auto">         
                                <div class="btn-group btn-group-toggle" data-toggle="buttons">
                                    <label class="btn btn-primary active">
                                        <input type="radio" name="options" id="operational" autocomplete="off" checked> Operational
                                    </label>
                                    <label class="btn btn-primary">
                                        <input type="radio" name="options" id="planning" autocomplete="off"> Study
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" id="cim-create-new-modal">Create</button>
                    </div>
                </div>
            </div>
        </div> 

        <div class="modal fade" id="cimFileSaveModel" tabindex="-1" role="dialog" aria-labelledby="cimFileSaveModelLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="cimFileSaveModelLabel">Enter File Name</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    </div>
                    <div class="modal-body">
                        <div class="row justify-content-center">
                            <div class="col-md-auto">         
                                <div class="btn-group btn-group-toggle" data-toggle="buttons">
                                        <input type="text" name="filename" id="cimFileName" style="width: 250px;"> 
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" id="cim-save-file-modal">Save</button>
                    </div>
                </div>
            </div>
        </div> 


    </div>

     <script>cimDrawTag.call(this, this.opts);</script>

</cimDraw>
