/*
 This tag renders a schematic diagram of a given CIM file.

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

<cimDiagram>
    <style>
    /* .app-diagram {
         max-height: 800px;
     }*/

     .app-diagram {
         background:white;
     }

     path.domain {
         fill: none;
         stroke: white;
     }

     g.tick > line {
         stroke: black;
         stroke-dasharray: 1 5;
     }

     /*svg {
         width: 1200px;
         height: 800px;
     }*/
 
     line.highlight-x, line.highlight-y {
         stroke: red;
         stroke-width: 1;
     }

     g.resize > rect {
         stroke: black;
         stroke-width: 1;
     }

    </style>
    <cimDiagramControls model={model}></cimDiagramControls>
    <div id="canvas">
    <div class="app-diagram" id="iframe-wrapper" style="float:left">   
        <!--  <svg width="1200" height="800" style="border: 1px solid black;">  -->
        <!--  <svg style="border: 1px solid black;" id="iframe-layer">  -->
        <svg style="border: 1px solid #ddd;"  id="svg-wrapper">
            <path stroke-width="1" stroke="black" fill="none"></path>
            <circle r="3.5" cy="-10" cx="-10"></circle>
            <g class="brush"></g>
            <g class="diagram-grid"></g>
            <g class="diagram-highlight">
                <line class="highlight-x"></line>
                <line class="highlight-y"></line>
            </g>
            <g class="diagram">
                <g class="edges"></g>
            </g>
        </svg>
    </div>    
    </div>    

    <script>cimDiagramTag.call(this, this.opts);</script>

</cimDiagram>

