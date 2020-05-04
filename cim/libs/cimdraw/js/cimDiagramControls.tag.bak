/*
 This tag renders the controls for a given CIM diagram.

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

<cimDiagramControls>
    <!--  <div class="container-fluid">
        <div class="row justify-content-center">
            <div class="col-md-auto">
                <div class="btn-toolbar" role="toolbar">
                    <div class="btn-group btn-group-toggle invisible" data-toggle="buttons" id="cim-diagram-controls">
                        <label class="btn btn-secondary active" id="selectLabel">
                            <input type="radio" id="select" name="tool" value="select" autocomplete="off" checked="checked">select
                        </label>
                        <label class="btn btn-secondary" id="panLabel">
                            <input type="radio" id="pan" name="tool" value="pan" autocomplete="off">pan
                        </label>
                        <label class="btn btn-secondary" id="connectLabel">
                            <input type="radio" id="connect" name="tool" value="connect" autocomplete="off">edit connections
                        </label>

                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span id="addElement">Insert element</span>
                                <span class="caret"></span>
                            </button>
                            <div class="dropdown-menu" id="cimElementList">
                                <h6 class="dropdown-header">Busses</h6>
                                <a class="dropdown-item" id="BusbarSection" onclick={enableAddMulti}>Node</a>
                                <h6 class="dropdown-header">Branches</h6>
                                <a class="dropdown-item" id="ACLineSegment" onclick={enableAddMulti}>AC Line Segment</a>
                                <h6 class="dropdown-header">Switches</h6>
                                <a class="dropdown-item" id="Breaker" onclick={enableAdd}>Breaker</a>
                                <a class="dropdown-item" id="Disconnector" onclick={enableAdd}>Disconnector</a>
                                <a class="dropdown-item" id="LoadBreakSwitch" onclick={enableAdd}>Load Break Switch</a>
                                <!-- junctions are still not implemented properly for now
                                     <!--<li class="dropdown-header">Connectors</li>-->
                                <!--<li id="cim:Junction" onclick={enableAdd}><a>Junction</a></li>-->
                                <!--<h6 class="dropdown-header">Equivalents</h6>
                                <a class="dropdown-item" id="EnergySource" onclick={enableAdd}>Energy Source</a>
                                <h6 class="dropdown-header">Rotating Machines</h6>
                                <a class="dropdown-item" id="SynchronousMachine" onclick={enableAdd}>Synchronous Machine</a>
                                <a class="dropdown-item" id="AsynchronousMachine" onclick={enableAdd}>Asynchronous Machine</a>
                                <h6 class="dropdown-header">Loads</h6>
                                <a class="dropdown-item" id="EnergyConsumer" onclick={enableAdd}>Energy Consumer</a>
                                <a class="dropdown-item" id="ConformLoad" onclick={enableAdd}>Conform Load</a>
                                <a class="dropdown-item" id="NonConformLoad" onclick={enableAdd}>Non Conform Load</a>
                                <h6 class="dropdown-header">Compensators</h6>
                                <a class="dropdown-item" id="LinearShuntCompensator" onclick={enableAdd}>Linear</a>
                                <a class="dropdown-item" id="NonlinearShuntCompensator" onclick={enableAdd}>Nonlinear</a>
                                <h6 class="dropdown-header">Transformers</h6>
                                <a class="dropdown-item" id="PowerTransformer" onclick={enableAdd}>Two-winding Transformer</a>
                                <a class="dropdown-item" id="PowerTransformer" onclick={enableAdd}>Three-winding Transformer</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>  -->

    	<div id="left-panel" style="border-right: 5px #3C7D91 double;>
        
			<div id="cimElement" class="drag-elements">
				<div class="header">
					<!--  <div class="search">
						<input class="form-control form-control-sm component-search" placeholder="Search components"
							type="text" data-vvveb-action="componentSearch" data-vvveb-on="keyup" id="cimElementSearch">
						<button class="clear-backspace" data-vvveb-action="clearComponentSearch" id="clearCimElementSearch">
							<i class="la la-close"></i>
						</button>
					</div>  -->
					<div class="drag-elements-sidepane sidepane">
						<div>
							<!-- <div class="dropdown-menu" id="cimElementList"> -->
							<ul class="components-list clearfix" data-type="leftpanel" id="left-panel-container">
								<!-- temp Code for faster development- to shift in json arrays in builder class to generate this automatically -->

								<li class="header clearfix" data-section="Busses Components" data-search="">
									<label class="header" for="leftpanel_comphead_Busses Components1">Busses
										<div class="header-arrow"></div> </label><input class="header_check"
										type="checkbox" checked="true" id="leftpanel_comphead_Busses Components1">
									<ol>
										<li id="BusbarSection" onclick={enableAddMulti} data-section="Busses Components" data-drag-type="component"
											data-type="components/products" data-search="Node"
											style="background-image: url(&quot;libs/builder/icons/cim_elements/busses_node.svg&quot;); background-repeat: no-repeat;">
										Node
										</li>


									</ol>
								</li>

								<li class="header clearfix" data-section="Branches Components" data-search="">
									<label class="header" for="leftpanel_comphead_Branches Components1">Branches
										<div class="header-arrow"></div> </label><input class="header_check"
										type="checkbox" checked="true" id="leftpanel_comphead_Branches Components1">
									<ol>
										<li id="ACLineSegment" onclick={enableAddMulti} data-section="Branches Components" data-drag-type="component"
											data-type="components/products" data-search="AC Line Segment"
											style="background-image: url(&quot;libs/builder/icons/cim_elements/branches_ac_line_segment.svg&quot;); background-repeat: no-repeat;">

											AC Line Segment

										</li>

									</ol>
								</li>

								<li class="header clearfix" data-section="Switches Components" data-search="">
									<label class="header" for="leftpanel_comphead_Switches Components1">Switches
										<div class="header-arrow"></div> </label><input class="header_check"
										type="checkbox" checked="true" id="leftpanel_comphead_Switches Components1">
									<ol>
										<li  id="Breaker" onclick={enableAdd} data-section="Switches Components" data-drag-type="component"
											data-type="components/products" data-search="products"
											style="background-image: url(&quot;libs/builder/icons/cim_elements/switches_breaker.svg&quot;); background-repeat: no-repeat;">
											Breaker
										</li>
										<li  id="Disconnector" onclick={enableAdd} data-section="Switches Components" data-drag-type="component"
											data-type="components/products" data-search="products"
											style="background-image: url(&quot;libs/builder/icons/cim_elements/switches_disconnector.svg&quot;); background-repeat: no-repeat;">
											Disconnector
										</li>
										<li id="LoadBreakSwitch" onclick={enableAdd} data-section="Switches Components" data-drag-type="component"
											data-type="components/products" data-search="products"
											style="background-image: url(&quot;libs/builder/icons/cim_elements/switches_load_break.svg&quot;); background-repeat: no-repeat;">
											Load Break Switch
										</li>

									</ol>
								</li>

								<li class="header clearfix" data-section="Equivalents Components" data-search="">
									<label class="header" for="leftpanel_comphead_Equivalents Components1">Equivalents
										<div class="header-arrow"></div> </label><input class="header_check"
										type="checkbox" checked="true" id="leftpanel_comphead_Equivalents Components1">
									<ol>
										<li  id="EnergySource" onclick={enableAdd} data-section="Equivalents Components" data-drag-type="component"
											data-type="components/products" data-search="products"
											style="background-image: url(&quot;libs/builder/icons/cim_elements/equivalents_energy_source.svg&quot;); background-repeat: no-repeat;">
											Energy Source

									</ol>
								</li>

								<li class="header clearfix" data-section="Rotating Machines Components" data-search="">
									<label class="header"
										for="leftpanel_comphead_Rotating Machines Components1">Rotating Machines
										<div class="header-arrow"></div> </label><input class="header_check"
										type="checkbox" checked="true"
										id="leftpanel_comphead_Rotating Machines Components1">
									<ol>
										<li  id="SynchronousMachine" onclick={enableAdd} data-section="Rotating Machines Components" data-drag-type="component"
											data-type="components/products" data-search="products"
											style="background-image: url(&quot;libs/builder/icons/cim_elements/rotating_machine_synchronous.svg&quot;); background-repeat: no-repeat;">
											Synchronous
										</li>
										<li id="AsynchronousMachine" onclick={enableAdd} data-section="Rotating Machines Components" data-drag-type="component"
											data-type="components/products" data-search="products"
											style="background-image: url(&quot;libs/builder/icons/cim_elements/rotating_machine_asynchronous.svg&quot;); background-repeat: no-repeat;">
											Asynchronous
										</li>
									</ol>
								</li>

								<li class="header clearfix" data-section="Loads Components" data-search="">
									<label class="header" for="leftpanel_comphead_Loads Components1">Loads
										<div class="header-arrow"></div> </label><input class="header_check"
										type="checkbox" checked="true" id="leftpanel_comphead_Loads Components1">
									<ol>
										<li  id="EnergyConsumer" onclick={enableAdd} data-section="Loads Components" data-drag-type="component"
											data-type="components/products" data-search="products"
											style="background-image: url(&quot;libs/builder/icons/cim_elements/energy_consumer_load.svg&quot;); background-repeat: no-repeat;">
											Energy Consumer
										</li>
										<li  id="ConformLoad" onclick={enableAdd} data-section="Loads Components" data-drag-type="component"
											data-type="components/products" data-search="products"
											style="background-image: url(&quot;libs/builder/icons/cim_elements/conform_load.svg&quot;); background-repeat: no-repeat;">
											Conform Load
										</li>
										<li id="NonConformLoad" onclick={enableAdd} data-section="Loads Components" data-drag-type="component"
											data-type="components/products" data-search="products"
											style="background-image: url(&quot;libs/builder/icons/cim_elements/non_conform_load.svg&quot;); background-repeat: no-repeat;">
											Non Conform Load
										</li>

									</ol>
								</li>

								<li class="header clearfix" data-section="Compensators Components" data-search="">
									<label class="header" for="leftpanel_comphead_Compensators Components1">Compensators
										<div class="header-arrow"></div> </label><input class="header_check"
										type="checkbox" checked="true" id="leftpanel_comphead_Compensators Components1">
									<ol>
										<li id="LinearShuntCompensator" onclick={enableAdd} data-section="Compensators Components" data-drag-type="component"
											data-type="components/products" data-search="products"
											style="background-image: url(&quot;libs/builder/icons/cim_elements/compensator_linear.svg&quot;); background-repeat: no-repeat;">
											Linear
										</li>
										<li  id="NonlinearShuntCompensator" onclick={enableAdd} data-section="Compensators Components" data-drag-type="component"
											data-type="components/products" data-search="products"
											style="background-image: url(&quot;libs/builder/icons/cim_elements/compensator_non_linear.svg&quot;); background-repeat: no-repeat;">
											Nonlinear
										</li>

									</ol>
								</li>

								<li class="header clearfix" data-section="Transformers Components" data-search="">
									<label class="header" for="leftpanel_comphead_Transformers Components1">Transformers
										<div class="header-arrow"></div> </label><input class="header_check"
										type="checkbox" checked="true" id="leftpanel_comphead_Transformers Components1">
									<ol>
										<li id="PowerTransformer" onclick={enableAdd} data-section="Transformers Components" data-drag-type="component"
											data-type="components/products" data-search="products"
											style="background-image: url(&quot;libs/builder/icons/cim_elements/transformer_two_winding.svg&quot;); background-repeat: no-repeat;">
											Two-winding
										</li>
										<li id="PowerTransformer3W" onclick={enableAdd} data-section="Transformers Components" data-drag-type="component"
											data-type="components/products" data-search="products"
											style="background-image: url(&quot;libs/builder/icons/cim_elements/transformer_three_winding.svg&quot;); background-repeat: no-repeat;">Three-winding</li>
									</ol>
								</li>

							</ul>
						</div>

					</div>
				</div>
			</div>
		</div>
		
    
    <script>cimDiagramControlsTag.call(this, this.opts);</script>

</cimDiagramControls>

