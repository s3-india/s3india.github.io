"use strict";

function cimDiagramTag(opts) {

    // Switch-related defs
    // const SWITCH_HEIGHT = 15; // height of switch elements
    // const SWITCH_WIDTH = 15; // width of switch elements
    const SWITCH_HEIGHT = 35; // height of switch elements
    const SWITCH_WIDTH = 35; // width of switch elements
    // generator-related defs
    // const GEN_HEIGHT = 50; // height of generator elements
    const GEN_HEIGHT = 45; // height of generator elements
    // load-related defs
    // const LOAD_HEIGHT = 20; // height of load elements
    // const LOAD_WIDTH = 30; // width of load elements
    const LOAD_HEIGHT = 30; // height of load elements
    const LOAD_WIDTH = 45; // width of load elements
    // compensator-related defs
    // const COMP_HEIGHT = 20; // height of compensator elements
    // const COMP_WIDTH = 30; // width of compensator elements
    const COMP_HEIGHT = 30; // height of compensator elements
    const COMP_WIDTH = 45; // width of compensator elements
    // trafo-related defs
    // const TRAFO_HEIGHT = 50; // height of transformer elements
    // const TRAFO_RADIUS = 15;
    const TRAFO_HEIGHT = 45; // height of transformer elements
    const TRAFO_RADIUS = 15;
    // terminal-related defs
    // const TERMINAL_RADIUS = 2; // radius of terminals
    // const TERMINAL_OFFSET = 1; // distance between element and its terminals
    const TERMINAL_RADIUS = 3; // radius of terminals
    const TERMINAL_OFFSET = 1; // distance between element and its terminals

    let self = this;

    let NODE_CLASS = "ConnectivityNode";
    let NODE_TERM = "ConnectivityNode.Terminals";
    let TERM_NODE = "Terminal.ConnectivityNode";

    self.model = opts.model;
    self.svgWidth = 0;
    self.svgHeight = 0;

    // listen to 'showDiagram' event from parent
    self.parent.on("cleanUp", function () {
        self.diagramName = "";
    });

    self.parent.on("showDiagram", function (file, name, element) {
        if (decodeURI(name) !== self.diagramName) {
            let mode = self.model.getMode();
            if (mode === "BUS_BRANCH") {
                NODE_CLASS = "TopologicalNode";
                NODE_TERM = "TopologicalNode.Terminal";
                TERM_NODE = "Terminal.TopologicalNode";
            }
            self.render(name);
        }
        if (typeof (element) !== "undefined") {
            self.moveTo(element);
            self.trigger("moveTo", element);
        } else {
            self.trigger("deselect");
        }
    });

    // listen to 'mount' event
    self.on("mount", function () {
        // setup xy axes
        let xScale = d3.scaleLinear().domain([0, 1200]).range([0, 1200]);
        let yScale = d3.scaleLinear().domain([0, 800]).range([0, 800]);
        let yAxis = d3.axisRight(yScale);
        let xAxis = d3.axisBottom(xScale);
        d3.select("svg").append("g").attr("id", "yAxisG").call(yAxis);
        d3.select("svg").append("g").attr("id", "xAxisG").call(xAxis);
        // draw grid
        self.drawGrid(1.0);
    });

    self.on('*', function (eventName) {
        console.info(eventName)
    })

    self.on("update", function () {

        console.log("on update: cimdiagram");
        self.drawGrid(1.0);

        let transform = d3.zoomTransform(d3.select("svg").node());
        let newx = transform.x;
        let newy = transform.y;
        let newZoom = transform.k;
        let svgWidth = parseInt(d3.select("svg").style("width"));
        let svgHeight = parseInt(d3.select("svg").style("height"));
        // manage axes
        let xScale = d3.scaleLinear().domain([-newx / newZoom, (svgWidth - newx) / newZoom]).range([0, svgWidth]);
        let yScale = d3.scaleLinear().domain([-newy / newZoom, (svgHeight - newy) / newZoom]).range([0, svgHeight]);
        let yAxis = d3.axisRight(yScale);
        let xAxis = d3.axisBottom(xScale);
        d3.select("svg").select("#yAxisG").call(yAxis);
        d3.select("svg").select("#xAxisG").call(xAxis);

        self.svgWidth = svgWidth;
        self.svgHeight = svgHeight;

    });

    // listen to 'transform' event
    self.on("transform", function () {
        let transform = d3.zoomTransform(d3.select("svg").node());
        let newx = transform.x;
        let newy = transform.y;
        let newZoom = transform.k;
        let svgWidth = parseInt(d3.select("svg").style("width"));
        let svgHeight = parseInt(d3.select("svg").style("height"));
        // manage axes
        let xScale = d3.scaleLinear().domain([-newx / newZoom, (svgWidth - newx) / newZoom]).range([0, svgWidth]);
        let yScale = d3.scaleLinear().domain([-newy / newZoom, (svgHeight - newy) / newZoom]).range([0, svgHeight]);
        let yAxis = d3.axisRight(yScale);
        let xAxis = d3.axisBottom(xScale);
        d3.select("svg").select("#yAxisG").call(yAxis);
        d3.select("svg").select("#xAxisG").call(xAxis);

        if (self.svgWidth != svgWidth || self.svgHeight != svgHeight) {
            self.drawGrid(1.0);
            self.svgWidth = svgWidth;
            self.svgHeight = svgHeight;
        }

        //self.updateEdges(newx, newy, newZoom);
    });

    // listen to 'setAttribute' event from model
    self.model.on("addToDiagram", function (object) {
        let lineData = [{
            x: 0,
            y: 0,
            seq: 1
        }];
        if (object.nodeName === "cim:ACLineSegment" || object.nodeName === "cim:BusbarSection") {
            lineData.push({
                x: 150,
                y: 0,
                seq: 2
            });
        }
        self.model.addToActiveDiagram(object, []);
    });

    self.model.on("setAttribute", function (object, attrName, value) {
        switch (attrName) {
            case "cim:IdentifiedObject.name":
                let type = object.localName;
                let uuid = object.attributes.getNamedItem("rdf:ID").value;
                // special case for busbars
                if (object.nodeName === "cim:BusbarSection") {
                    let cn = self.model.getNode(object);
                    if (cn === null) {
                        return;
                    }
                    type = cn.localName;
                    uuid = cn.attributes.getNamedItem("rdf:ID").value;
                }
                let types = d3.select("svg").selectAll("svg > g.diagram > g." + type + "s");
                let target = types.select("#cimdiagram-" + uuid);
                target.select("text").html(value);
                break;
            case "cim:AnalogValue.value":
                let analog = self.model.getTargets(
                    [object],
                    "AnalogValue.Analog");
                let psr = self.model.getTargets(
                    analog,
                    "Measurement.PowerSystemResource")[0];
                // handle busbars
                if (psr.nodeName === "cim:BusbarSection") {
                    psr = self.model.getNode(psr);
                }
                let psrUUID = psr.attributes.getNamedItem("rdf:ID").value;
                let psrSelection = d3.select("g#cimDiagram-" + psrUUID);
                self.createStatusInfo(psrSelection);
                break;
            case "cim:SvPowerFlow.p":
            case "cim:SvPowerFlow.q":
                let svTerminal = self.model.getTargets(
                    [object],
                    "SvPowerFlow.Terminal")[0];
                if (typeof (svTerminal) !== "undefined") {
                    let psr = self.model.getTargets(
                        [svTerminal],
                        "Terminal.ConductingEquipment")[0];
                    let psrUUID = psr.attributes.getNamedItem("rdf:ID").value;
                    let psrSelection = d3.select("g#cimDiagram-" + psrUUID);
                    self.createStatusInfo(psrSelection);
                }
                break;
        }
        if (object.nodeName === "cim:Analog" ||
            object.nodeName === "cim:Discrete") {
            let psr = self.model.getTargets(
                [object],
                "Measurement.PowerSystemResource")[0];
            if (typeof (psr) !== "undefined") {
                // handle busbars
                if (psr.nodeName === "cim:BusbarSection") {
                    psr = self.model.getNode(psr);
                }
                let psrUUID = psr.attributes.getNamedItem("rdf:ID").value;
                let psrSelection = d3.select("g#cimdiagram-" + psrUUID);
                self.createStatusInfo(psrSelection);
            }
        }
        if (object.nodeName === "cim:OperationalLimitSet") {
            let psr = self.model.getTargets(
                [object],
                "OperationalLimitSet.Equipment");
            // limit sets may also be associated to terminals
            let terms = self.model.getTargets(
                [object],
                "OperationalLimitSet.Terminal");
            psr = psr.concat(self.model.getTargets(
                terms,
                "Terminal.ConductingEquipment"))[0];
            if (typeof (psr) !== "undefined") {
                // handle busbars
                if (psr.nodeName === "cim:BusbarSection") {
                    psr = self.model.getNode(psr);
                }
                let psrUUID = psr.attributes.getNamedItem("rdf:ID").value;
                let psrSelection = d3.select("g#cimDiagram-" + psrUUID);
                self.createStatusInfo(psrSelection);
            }
        }
    });

    // listen to 'setEnum' event from model
    self.model.on("setEnum", function (object, enumName, value) {
        if (object.nodeName === "cim:Analog" || object.nodeName === "cim:Discrete") {
            let psr = self.model.getTargets(
                [object],
                "Measurement.PowerSystemResource")[0];
            if (typeof (psr) !== "undefined") {
                // handle busbars
                if (psr.nodeName === "cim:BusbarSection") {
                    psr = self.model.getNode(psr);
                }
                let psrUUID = psr.attributes.getNamedItem("rdf:ID").value;
                let psrSelection = d3.select("g#cimdiagram-" + psrUUID);
                self.createStatusInfo(psrSelection);
            }
        }
    });

    // Listen to 'updateActiveDiagram' event from model.
    // This should replace the calls to 'forceTick' in other components.
    self.model.on("updateActiveDiagram", function (object) {
        let selection = null;
        switch (object.nodeName) {
            case "cim:ACLineSegment":
                selection = self.drawACLines([object])[0];
                self.createTerminals(selection);
                break;
            case "cim:" + NODE_CLASS:
                self.drawNodes([object]);
                break;
        }
        let type = object.localName;
        let uuid = object.attributes.getNamedItem("rdf:ID").value;
        let types = d3.select("svg").selectAll("svg > g.diagram > g." + type + "s");
        let target = types.select("#cimdiagram-" + uuid);
        self.forceTick(target);
    });

    // listen to 'addToActiveDiagram' event from model
    self.model.on("addToActiveDiagram", function (object) {
        let selection = null;
        switch (object.nodeName) {
            case "cim:ACLineSegment":
                selection = self.drawACLines([object])[1]; // TODO: handle correctly
                break;
            case "cim:Breaker":
                selection = self.drawBreakers([object]);
                break;
            case "cim:Disconnector":
                selection = self.drawDisconnectors([object]);
                break;
            case "cim:LoadBreakSwitch":
                selection = self.drawLoadBreakSwitches([object]);
                break;
            case "cim:Junction":
                selection = self.drawJunctions([object]);
                break;
            case "cim:EnergySource":
                selection = self.drawEnergySources([object]);
                break;
            case "cim:SynchronousMachine":
                selection = self.drawSynchronousMachines([object]);
                break;
            case "cim:AsynchronousMachine":
                selection = self.drawAsynchronousMachines([object]);
                break;
            case "cim:EnergyConsumer":
                selection = self.drawEnergyConsumers([object]);
                break;
            case "cim:ConformLoad":
                selection = self.drawConformLoads([object]);
                break;
            case "cim:NonConformLoad":
                selection = self.drawNonConformLoads([object]);
                break;
            case "cim:EquivalentInjection":
                selection = self.drawEquivalentInjections([object]);
                break;
            case "cim:LinearShuntCompensator":
                selection = self.drawLinearCompensators([object]);
                break;
            case "cim:NonlinearShuntCompensator":
                selection = self.drawNonlinearCompensators([object]);
                break;
            case "cim:PowerTransformer":
                selection = self.drawPowerTransformers([object]);
                break;
            case "cim:" + NODE_CLASS:
                selection = self.drawNodes([object]);
                updateEdges(object, null);
                break;
        }

        if (selection !== null) {
            handleTerminals(selection);
        }
        // handle busbars
        if (object.nodeName === "cim:BusbarSection") {
            let terminal = self.model.getTargets(
                [object],
                "ConductingEquipment.Terminals");
            let cn = self.model.getTargets(
                terminal,
                TERM_NODE)[0];
            selection = self.drawNodes([cn]);
            updateEdges(cn, object);
        }

        if (selection !== null) {
            self.forceTick(selection);
            self.trigger("addToDiagram", selection);
        }

        function handleTerminals(selection) {

            /*
                to get the list of terminals for the given object (eg: Breaker) Passed as an argument.
                For Breaker we get two terminal objects.
            */
            let terminals = self.model.getTerminals([object]); 
            for (let terminal of terminals) {
                let cn = self.model.getTargets(
                    [terminal],
                    TERM_NODE)[0];

                //if cn is undefined means there is no connectivity node or Topological Node for the given list of terminals
                if (typeof (cn) !== "undefined") {
                    let equipments = self.model.getEquipments(cn);
                    // let's try to get a busbar section
                    let busbarSection = equipments.filter(el => el.localName === "BusbarSection")[0];
                    equipments = equipments.filter(el => el !== busbarSection);
                    if (equipments.length > 1) {
                        self.drawNodes([cn]);

                        let eqTerminals = self.model.getTerminals(equipments);
                        for (let eqTerminal of eqTerminals) {
                            let eqCn = self.model.getTargets(
                                [eqTerminal],
                                TERM_NODE)[0];
                            if (eqCn === cn) {
                                let newEdge = {
                                    source: cn,
                                    target: eqTerminal
                                };
                                self.createEdges([newEdge]);
                            }
                        }
                    }
                }
            }
            self.createTerminals(selection);
        };

        function updateEdges(node, busbar) {
            let equipments = self.model.getEquipments(node).filter(eq => eq !== busbar);
            let eqTerminals = self.model.getTerminals(equipments);
            for (let eqTerminal of eqTerminals) {
                if (typeof (eqTerminal.x) === "undefined") {
                    continue;
                }
                let eqNode = self.model.getTargets(
                    [eqTerminal],
                    TERM_NODE)[0];
                if (eqNode === node) {
                    let newEdge = {
                        source: node,
                        target: eqTerminal
                    };
                    self.createEdges([newEdge]);
                }
            }
        };

    });

    // listen to 'addLink' event from model
    // this function checks if the terminal belongs to the current diagram
    // TODO: should check also the connectivity node
    self.model.on("addLink", function (source, linkName, target) {
        switch (linkName) {
            case "cim:" + TERM_NODE:
            case "cim:" + NODE_TERM: {
                let cn = undefined;
                let term = undefined;
                if (target.nodeName === "cim:Terminal" && source.nodeName === "cim:" + NODE_CLASS) {
                    cn = source;
                    term = target;
                } else {
                    if (source.nodeName === "cim:Terminal" && target.nodeName === "cim:" + NODE_CLASS) {
                        term = source;
                        cn = target;
                    } else {
                        return;
                    }
                }
                let edgeToChange = d3.select("svg").selectAll("svg > g.diagram > g.edges > g").data().filter(el => el.target === term)[0];
                if (typeof (edgeToChange) === "undefined") {
                    let equipment = self.model.getTargets(
                        [term],
                        "Terminal.ConductingEquipment");
                    let dobjs = self.model.getDiagramObjects(equipment);
                    if (dobjs.length > 0) {
                        edgeToChange = {
                            source: cn,
                            target: term
                        };
                        self.createEdges([edgeToChange]);
                    }
                } else {
                    edgeToChange.source = cn;
                }
                let cnUUID = cn.attributes.getNamedItem("rdf:ID").value;
                let selection = d3.select("svg > g.diagram > g." + NODE_CLASS + "s > g#cimdiagram-" + cnUUID);
                self.forceTick(selection);
                break;
            }
            case "cim:Terminal.SvPowerFlow":
            case "cim:SvPowerFlow.Terminal": {
                // power flow results
                let terminal = target;
                if (source.nodeName === "cim:Terminal") {
                    terminal = source;
                }
                if (typeof (terminal) !== "undefined") {
                    let psr = self.model.getTargets(
                        [terminal],
                        "Terminal.ConductingEquipment")[0];
                    let psrUUID = psr.attributes.getNamedItem("rdf:ID").value;
                    let psrSelection = d3.select("g#cimdiagram-" + psrUUID);
                    self.createStatusInfo(psrSelection);
                }
                break;
            }
            case "cim:Measurement.Terminal":
            case "cim:ACDCTerminal.Measurements": {
                let terminal = target;
                if (source.nodeName === "cim:Terminal") {
                    terminal = source;
                }
                let psr = self.model.getTargets(
                    [terminal],
                    "Terminal.ConductingEquipment")[0];
                let measPsrUUID = psr.attributes.getNamedItem("rdf:ID").value;
                let measPsrSelection = d3.select("g#cimdiagram-" + measPsrUUID);
                self.createStatusInfo(measPsrSelection);
                break;
            }
            case "cim:Measurement.PowerSystemResource":
            case "cim:PowerSystemResource.Measurements": {
                let psr = target;
                if (linkName === "cim:PowerSystemResource.Measurements") {
                    psr = source;
                }
                if (typeof (psr) !== "undefined") {
                    // handle busbars
                    if (psr.nodeName === "cim:BusbarSection") {
                        psr = self.model.getNode(psr);
                    }
                    let psrUUID = psr.attributes.getNamedItem("rdf:ID").value;
                    let psrSelection = d3.select("g#cimdiagram-" + psrUUID);
                    self.createStatusInfo(psrSelection);
                }
                break;
            }
            case "cim:OperationalLimitSet.Terminal":
            case "cim:ACDCTerminal.OperationalLimitSet": {
                let terminal = target;
                if (source.nodeName === "cim:Terminal") {
                    terminal = source;
                }
                let psr = self.model.getTargets(
                    [terminal],
                    "Terminal.ConductingEquipment")[0];
                let limPsrUUID = psr.attributes.getNamedItem("rdf:ID").value;
                let limPsrSelection = d3.select("g#cimdiagram-" + limPsrUUID);
                self.createStatusInfo(limPsrSelection);
                break;
            }
            case "cim:OperationalLimitSet.Equipment":
            case "cim:Equipment.OperationalLimitSet": {
                let psr = target;
                if (linkName === "cim:Equipment.OperationalLimitSet") {
                    psr = source;
                }
                if (typeof (psr) !== "undefined") {
                    // handle busbars
                    if (psr.nodeName === "cim:BusbarSection") {
                        psr = self.model.getNode(psr);
                    }
                    let psrUUID = psr.attributes.getNamedItem("rdf:ID").value;
                    let psrSelection = d3.select("g#cimdiagram-" + psrUUID);
                    self.createStatusInfo(psrSelection);
                }
                break;
            }
        }
    });

    // listen to 'removeLink' event from model
    self.model.on("removeLink", function (source, linkName, target) {
        switch (linkName) {
            case "cim:Measurement.PowerSystemResource":
            case "cim:PowerSystemResource.Measurements": {
                let psr = target;
                if (linkName === "cim:PowerSystemResource.Measurements") {
                    psr = source;
                }
                if (typeof (psr) !== "undefined") {
                    // handle busbars
                    if (psr.nodeName === "cim:BusbarSection") {
                        psr = self.model.getNode(psr);
                    }
                    let psrUUID = psr.attributes.getNamedItem("rdf:ID").value;
                    let psrSelection = d3.select("g#" + psrUUID);
                    self.createStatusInfo(psrSelection);
                }
                break;
            }
            case "cim:" + TERM_NODE:
            case "cim:" + NODE_TERM: {
                let cn = undefined;
                let term = undefined;
                if (target.nodeName === "cim:Terminal" && source.nodeName === "cim:" + NODE_CLASS) {
                    cn = source;
                    term = target;
                } else {
                    if (source.nodeName === "cim:Terminal" && target.nodeName === "cim:" + NODE_CLASS) {
                        term = source;
                        cn = target;
                    } else {
                        return;
                    }
                }
                d3.select("svg")
                    .selectAll("svg > g.diagram > g.edges > g")
                    .filter(function (d) {
                        return d.target === term
                    })
                    .remove();
                break;
            }
            case "cim:OperationalLimitSet.Terminal":
            case "cim:ACDCTerminal.OperationalLimitSet": {
                let terminal = target;
                if (source.nodeName === "cim:Terminal") {
                    terminal = source;
                }
                let psr = self.model.getTargets(
                    [terminal],
                    "Terminal.ConductingEquipment")[0];
                if (typeof (psr) !== "undefined") {
                    let limPsrUUID = psr.attributes.getNamedItem("rdf:ID").value;
                    let limPsrSelection = d3.select("g#" + limPsrUUID);
                    self.createStatusInfo(limPsrSelection);
                }
                break;
            }
            case "cim:OperationalLimitSet.Equipment":
            case "cim:Equipment.OperationalLimitSet": {
                let psr = target;
                if (linkName === "cim:Equipment.OperationalLimitSet") {
                    psr = source;
                }
                if (typeof (psr) !== "undefined") {
                    // handle busbars
                    if (psr.nodeName === "cim:BusbarSection") {
                        psr = self.model.getNode(psr);
                    }
                    if (psr !== null) {
                        let psrUUID = psr.attributes.getNamedItem("rdf:ID").value;
                        let psrSelection = d3.select("g#" + psrUUID);
                        self.createStatusInfo(psrSelection);
                    }
                }
                break;
            }
        }
    });

    self.render = function (diagramName) {
        let diagramRender = self.renderGenerator(diagramName);

        function periodic() {
            let ret = diagramRender.next().value;
            if (typeof (ret) !== "undefined") {
                $("#loadingDiagramMsg").html("<br>" + ret);
                setTimeout(periodic, 1);
            } else {
                self.parent.trigger("loaded");
            }
        };
        periodic();
    }

    /** Main rendering function */
    self.renderGenerator = function* (diagramName) {
        // clear all
        d3.select("svg").select("g.diagram").selectAll("g:not(.edges)").remove();

        self.model.selectDiagram(decodeURI(diagramName));
        self.diagramName = decodeURI(diagramName);
        let allNodes = self.model.getNodes();
        yield "DIAGRAM: extracted nodes";

        let allEquipments = self.model.getGraphicObjects(
            ["cim:ACLineSegment",
                "cim:Breaker",
                "cim:Disconnector",
                "cim:LoadBreakSwitch",
                "cim:Junction",
                "cim:EnergySource",
                "cim:SynchronousMachine",
                "cim:AsynchronousMachine",
                "cim:EnergyConsumer",
                "cim:ConformLoad",
                "cim:NonConformLoad",
                "cim:EquivalentInjection",
                "cim:PowerTransformer",
                "cim:BusbarSection",
                "cim:LinearShuntCompensator",
                "cim:NonlinearShuntCompensator"
            ]);
        let allACLines = allEquipments["cim:ACLineSegment"];
        let allBreakers = allEquipments["cim:Breaker"];
        let allDisconnectors = allEquipments["cim:Disconnector"];
        let allLoadBreakSwitches = allEquipments["cim:LoadBreakSwitch"];
        let allJunctions = allEquipments["cim:Junction"];
        let allEnergySources = allEquipments["cim:EnergySource"];
        let allSynchronousMachines = allEquipments["cim:SynchronousMachine"];
        let allAsynchronousMachines = allEquipments["cim:AsynchronousMachine"];
        let allEnergyConsumers = allEquipments["cim:EnergyConsumer"];
        let allConformLoads = allEquipments["cim:ConformLoad"];
        let allNonConformLoads = allEquipments["cim:NonConformLoad"];
        let allEquivalentInjections = allEquipments["cim:EquivalentInjection"];
        let allPowerTransformers = allEquipments["cim:PowerTransformer"];
        let allBusbarSections = allEquipments["cim:BusbarSection"];
        let allLinearShuntCompensators = allEquipments["cim:LinearShuntCompensator"];
        let allNonlinearShuntCompensators = allEquipments["cim:NonlinearShuntCompensator"];
        yield "DIAGRAM: extracted equipments";

        // AC Lines
        let aclineEnter = self.drawACLines(allACLines)[1];
        yield "DIAGRAM: drawn acLines";
        // breakers
        let breakerEnter = self.drawBreakers(allBreakers);
        yield "DIAGRAM: drawn breakers";
        // disconnectors
        let discEnter = self.drawDisconnectors(allDisconnectors);
        yield "DIAGRAM: drawn disconnectors";
        // load break switches
        let lbsEnter = self.drawLoadBreakSwitches(allLoadBreakSwitches);
        yield "DIAGRAM: drawn load break switches";
        // junctions
        let junctsEnter = self.drawJunctions(allJunctions);
        yield "DIAGRAM: drawn junctions";
        // energy sources
        let ensrcEnter = self.drawEnergySources(allEnergySources);
        yield "DIAGRAM: drawn energy sources";
        // synchronous machines
        let syncEnter = self.drawSynchronousMachines(allSynchronousMachines);
        yield "DIAGRAM: drawn synchronous machines";
        // asynchronous machines
        let asyncEnter = self.drawAsynchronousMachines(allAsynchronousMachines);
        yield "DIAGRAM: drawn asynchronous machines";
        // energy consumers
        let enconsEnter = self.drawEnergyConsumers(allEnergyConsumers);
        yield "DIAGRAM: drawn energy consumers";
        // conform loads
        let confEnter = self.drawConformLoads(allConformLoads);
        yield "DIAGRAM: drawn conform loads";
        // non conform loads
        let nonconfEnter = self.drawNonConformLoads(allNonConformLoads);
        yield "DIAGRAM: drawn non conform loads";
        // equivalent injections
        let eqInjEnter = self.drawEquivalentInjections(allEquivalentInjections);
        yield "DIAGRAM: drawn equivalent injections";
        // power transformers
        let trafoEnter = self.drawPowerTransformers(allPowerTransformers);
        yield "DIAGRAM: drawn power transformers";
        // linear shunt compensators
        let lshuntEnter = self.drawLinearCompensators(allLinearShuntCompensators);
        yield "DIAGRAM: drawn linear shunt compensators";
        // nonlinear shunt compensators
        let nlshuntEnter = self.drawNonlinearCompensators(allNonlinearShuntCompensators);
        yield "DIAGRAM: drawn nonlinear shunt compensators";
        // connectivity nodes
        let cnEnter = self.drawNodes(allNodes);
        self.createStatusInfo(cnEnter);
        yield "DIAGRAM: drawn connectivity nodes";

        // ac line terminals
        let termSelection = self.createTerminals(aclineEnter);
        self.createStatusInfo(aclineEnter);
        yield "DIAGRAM: drawn acline terminals";
        // breaker terminals
        self.createTerminals(breakerEnter);
        self.createStatusInfo(breakerEnter);
        yield "DIAGRAM: drawn breaker terminals";
        // disconnector terminals
        self.createTerminals(discEnter);
        self.createStatusInfo(discEnter);
        yield "DIAGRAM: drawn disconnector terminals";
        // load break switch terminals
        self.createTerminals(lbsEnter);
        self.createStatusInfo(lbsEnter);
        yield "DIAGRAM: drawn load break switch terminals";
        // junction terminals
        self.createTerminals(junctsEnter);
        self.createStatusInfo(junctsEnter);
        yield "DIAGRAM: drawn junction terminals";
        // energy source terminals
        termSelection = self.createTerminals(ensrcEnter);
        self.createStatusInfo(ensrcEnter);
        yield "DIAGRAM: drawn energy source terminals";
        // synchronous machine terminals
        termSelection = self.createTerminals(syncEnter);
        self.createStatusInfo(syncEnter);
        yield "DIAGRAM: drawn synchronous machine terminals";
        // asynchronous machine terminals
        termSelection = self.createTerminals(asyncEnter);
        self.createStatusInfo(asyncEnter);
        yield "DIAGRAM: drawn asynchronous machine terminals";
        // energy consumer terminals
        termSelection = self.createTerminals(enconsEnter);
        self.createStatusInfo(enconsEnter);
        yield "DIAGRAM: drawn energy consumer terminals";
        // conform load terminals
        termSelection = self.createTerminals(confEnter);
        self.createStatusInfo(confEnter);
        yield "DIAGRAM: drawn conform load terminals";
        // non conform load terminals
        termSelection = self.createTerminals(nonconfEnter);
        self.createStatusInfo(nonconfEnter);
        yield "DIAGRAM: drawn non conform load terminals";
        // equivalent injection terminals
        termSelection = self.createTerminals(eqInjEnter);
        self.createStatusInfo(eqInjEnter);
        yield "DIAGRAM: drawn equivalent injection terminals";
        // power transformer terminals
        termSelection = self.createTerminals(trafoEnter);
        self.createStatusInfo(trafoEnter);
        yield "DIAGRAM: drawn power transformer terminals";
        // linear shunt compensator terminals
        termSelection = self.createTerminals(lshuntEnter);
        self.createStatusInfo(lshuntEnter);
        yield "DIAGRAM: drawn linear shunt compensator terminals";
        // nonlinear shunt compensator terminals
        termSelection = self.createTerminals(nlshuntEnter);
        self.createStatusInfo(nlshuntEnter);
        yield "DIAGRAM: drawn nonlinear shunt compensator terminals";

        d3.select("svg").on("dragover", function () {
            d3.event.preventDefault();
        }).on("drop", function () {
            d3.event.preventDefault();
            let objUUID = d3.event.dataTransfer.getData("text/plain");
            if (typeof (objUUID) === "undefined") {
                return;
            }
            let datum = self.model.getObject(objUUID);
            if (typeof (datum) === "undefined") {
                return;
            }
            let dobjs = self.model.getDiagramObjects([datum]);
            if (dobjs.length > 0) {
                self.moveTo(objUUID);
            } else {


                //delete it it added by SS
                let allEquipments = self.model.getObjects(
                    ["cim:ACLineSegment",
                        "cim:Breaker",
                        "cim:Disconnector",
                        "cim:LoadBreakSwitch",
                        "cim:Junction",
                        "cim:EnergySource",
                        "cim:SynchronousMachine",
                        "cim:AsynchronousMachine",
                        "cim:EnergyConsumer",
                        "cim:ConformLoad",
                        "cim:NonConformLoad",
                        "cim:EquivalentInjection",
                        "cim:PowerTransformer",
                        "cim:BusbarSection",
                        "cim:LinearShuntCompensator",
                        "cim:NonlinearShuntCompensator"
                    ]);

                for (var key in allEquipments) {
                    for (let i = 0; i < allEquipments[key].length; i++) {
                        self.addToDiagram(allEquipments[key][i]);
                    }
                }

                // add object to diagram
                self.addToDiagram(datum);

            }
        });

        function mouseOut(d) {
            d3.select(this).selectAll("rect").remove();
        }

        self.forceTick();
        self.trigger("render");
    }

    self.createEdges = function (edges) {
        let edgesEnter = d3
            .select("svg")
            .select("g > g.edges")
            .selectAll("g.edge")
            .data(edges, function (d) {
                return d.source.attributes[0].value + d.target.attributes[0].value;
            })
            .enter()
            .append("g")
            .attr("class", "edge")
            .attr("id", function (d) {
                return d.source.attributes[0].value + d.target.attributes[0].value;
            })
            .append("path")
            .attr("fill", "none")
            .attr("stroke", "black")
            //.attr("stroke-width", 1);
            .attr("stroke-width", 3);
        self.trigger("createEdges", edgesEnter);
    }

    // Create element status info (measurements, state variables, operational
    // limits) associated with a selection of terminals or power system resources.
    // This is visualized as a popover.
    // TODO: junctions
    self.createStatusInfo = function (psrSelection) {
        psrSelection.attr("data-toggle", "popover");
        // change fill color of switches based on their status
        let path = psrSelection.filter(function (d) {
            return self.model.schema.isA("Switch", d);
        }).selectAll("path");
        path.attr("fill", function (d) {
            // check the status of this switch
            let measurement = self.model.getTargets(
                [d],
                "PowerSystemResource.Measurements")[0];
            let value = self.getDiscreteValue(measurement);
            if (value === "0") {
                return "white";
            } else {
                return "black";
            }
        });
        psrSelection.each(function (d) {
            let measurements = [];
            let svPFs = [];
            let limitSets = [];
            // get the voltage state variables for this equipment
            let svVs = self.model.getTargets([d], "TopologicalNode.SvVoltage");
            let terminals = self.model.getTerminals([d]);
            // get the measurements and limit sets for this equipment
            if (d.nodeName === "cim:" + NODE_CLASS) {
                let busbar = self.model.getBusbar(d);
                if (busbar === null) {
                    return;
                }
                terminals = self.model.getTerminals([busbar]);
                measurements = self.model.getTargets(
                    [busbar],
                    "PowerSystemResource.Measurements");
                limitSets = self.model.getTargets(
                    [busbar],
                    "Equipment.OperationalLimitSet");
            } else {
                measurements = self.model.getTargets(
                    [d],
                    "PowerSystemResource.Measurements");
                limitSets = self.model.getTargets(
                    [d],
                    "Equipment.OperationalLimitSet");
            }
            // limit sets may also be associated to terminals
            limitSets = limitSets.concat(self.model.getTargets(
                terminals,
                "ACDCTerminal.OperationalLimitSet"));
            // get the PF state variables for this equipment
            for (let terminal of terminals) {
                let actTermSvPFs = self.model.getTargets(
                    [terminal],
                    "Terminal.SvPowerFlow");
                svPFs = svPFs.concat(actTermSvPFs);
            }
            if (measurements.length > 0 || svPFs.length > 0 || svVs.length > 0 || limitSets.length > 0) {
                let tooltip = self.createTooltip(measurements, svPFs, svVs, limitSets);
                // create the actual popover
                $(this).popover("dispose").popover({
                    title: "<b>Element Status Info</b>",
                    content: tooltip,
                    container: "body",
                    html: true,
                    trigger: "manual",
                    delay: {
                        "show": 200,
                        "hide": 0
                    },
                    placement: "auto"
                });
            } else {
                // no measurements, destroy popover
                d3.select(this).attr("data-toggle", null);
                $(this).popover("destroy");
            }
        })
    }

    // Get the discrete value associated to a measurement, if available.
    // Defaults to OPEN.
    self.getDiscreteValue = function (measurement) {
        let value = "0"; // default is OPEN
        if (typeof (measurement) !== "undefined") {
            let valueObject = self.model.getTargets(
                [measurement],
                "Discrete.DiscreteValues")[0];
            if (typeof (valueObject) !== "undefined") {
                let valueAttribute = self.model.getAttribute(valueObject, "cim:DiscreteValue.value");
                if (typeof (valueAttribute) !== "undefined") {
                    value = valueAttribute.textContent;
                }
            }
        }
        return value;
    }

    // create the actual tooltip content for element status info
    self.createTooltip = function (measurements, svPFs, svVs, limitSets) {
        let tooltip = "";
        if (measurements.length > 0) {
            tooltip = tooltip + "<b>Measurements</b><br><br>";
            let tooltipLines = [];
            for (let measurement of measurements) {
                let type = "unnamed";
                let phases = "ABC";
                let unitMultiplier = "";
                let unitSymbol = "no unit";
                let typeAttr = self.model.getAttribute(measurement, "cim:IdentifiedObject.name");
                let phasesAttr = self.model.getEnum(measurement, "cim:Measurement.phases");
                let unitMultiplierAttr = self.model.getEnum(measurement, "cim:Measurement.unitMultiplier");
                let unitSymbolAttr = self.model.getEnum(measurement, "cim:Measurement.unitSymbol");
                if (typeof (typeAttr) !== "undefined") {
                    type = typeAttr.textContent;
                }
                if (typeof (phasesAttr) !== "undefined") {
                    phases = phasesAttr.attributes[0].textContent.split("#")[1].split(".")[1];
                }
                if (typeof (unitMultiplierAttr) !== "undefined") {
                    unitMultiplier = unitMultiplierAttr.attributes[0].textContent.split("#")[1].split(".")[1];
                    if (unitMultiplier === "none") {
                        unitMultiplier = "";
                    }
                }
                if (typeof (unitSymbolAttr) !== "undefined") {
                    unitSymbol = unitSymbolAttr.attributes[0].textContent.split("#")[1].split(".")[1];
                }
                let valueObject = self.model.getTargets(
                    [measurement],
                    "Analog.AnalogValues")[0];
                let actLine = "";
                let value = "n.a."
                if (typeof (valueObject) !== "undefined") {
                    if (typeof (self.model.getAttribute(valueObject, "cim:AnalogValue.value")) !== "undefined") {
                        value = self.model.getAttribute(valueObject, "cim:AnalogValue.value").textContent;
                        value = parseFloat(value).toFixed(2);
                    }
                } else {
                    value = self.getDiscreteValue(measurement);
                    value = parseInt(value);
                }
                let measUUID = measurement.attributes.getNamedItem("rdf:ID").value;
                let hashComponents = window.location.hash.split("/");
                let basePath = hashComponents[0] + "/" + hashComponents[1] + "/" + hashComponents[2];
                let targetPath = basePath + "/" + measUUID;
                actLine = actLine + "<a href=" + targetPath + ">" + type + "</a>";
                actLine = actLine + " (phase: " + phases + ")";
                actLine = actLine + ": ";
                actLine = actLine + value;
                actLine = actLine + " [" + unitMultiplier + unitSymbol + "]";
                actLine = actLine + "<br>";
                tooltipLines.push(actLine);
            }
            tooltipLines.sort();
            for (let i in tooltipLines) {
                tooltip = tooltip + tooltipLines[i];
            }
        }

        // power flow results
        if (svPFs.length > 0) {
            if (tooltip !== "") {
                tooltip = tooltip + "<br>";
            }
            tooltip = tooltip + "<b>Power flow results (Power)</b><br><br>";
            for (let sv of svPFs) {
                let p = 0.0,
                    q = 0.0;
                if (typeof (self.model.getAttribute(sv, "cim:SvPowerFlow.p")) !== "undefined") {
                    p = self.model.getAttribute(sv, "cim:SvPowerFlow.p").textContent;
                }
                if (typeof (self.model.getAttribute(sv, "cim:SvPowerFlow.q")) !== "undefined") {
                    q = self.model.getAttribute(sv, "cim:SvPowerFlow.q").textContent;
                }
                let actLine = "Active Power: " + parseFloat(p).toFixed(2) + " [MW]";
                actLine = actLine + "<br>";
                actLine = actLine + "Reactive power: " + parseFloat(q).toFixed(2) + " [MVAr]";
                actLine = actLine + "<br>";
                tooltip = tooltip + actLine;
            }
        }

        if (svVs.length > 0) {
            if (tooltip !== "") {
                tooltip = tooltip + "<br>";
            }
            tooltip = tooltip + "<b>Power flow results (Voltage)</b><br><br>";
            for (let sv of svVs) {
                let v = 0.0,
                    ang = 0.0;
                if (typeof (self.model.getAttribute(sv, "cim:SvVoltage.v")) !== "undefined") {
                    v = self.model.getAttribute(sv, "cim:SvVoltage.v").textContent;
                }
                if (typeof (self.model.getAttribute(sv, "cim:SvVoltage.angle")) !== "undefined") {
                    ang = self.model.getAttribute(sv, "cim:SvVoltage.angle").textContent;
                }
                let actLine = "Voltage magnitude: " + parseFloat(v).toFixed(2) + " [kV]";
                actLine = actLine + "<br>";
                actLine = actLine + "Voltage angle: " + parseFloat(ang).toFixed(2) + " [deg]";
                actLine = actLine + "<br>";
                tooltip = tooltip + actLine;
            }
        }

        if (limitSets.length > 0) {
            if (tooltip !== "") {
                tooltip = tooltip + "<br>";
            }
            tooltip = tooltip + "<b>Operational limit sets</b><br><br>";
            for (let limitSet of limitSets) {
                let type = "unnamed";
                let typeAttr = self.model.getAttribute(limitSet, "cim:IdentifiedObject.name");
                if (typeof (typeAttr) !== "undefined") {
                    type = typeAttr.textContent;
                }
                let uuid = limitSet.attributes.getNamedItem("rdf:ID").value;
                let hashComponents = window.location.hash.split("/");
                let basePath = hashComponents[0] + "/" + hashComponents[1] + "/" + hashComponents[2];
                let targetPath = basePath + "/" + uuid;
                let actLine = "<a href=" + targetPath + ">" + type + "</a><br>";
                tooltip = tooltip + actLine;
            }
        }
        return tooltip;
    }

    // bind data to an x,y array from Diagram Object Points
    // returns a 2 element array: the first is the update selection
    // and the second is the enter selection.
    // The first argument is the CIM type, like "ACLineSegment", the
    // second is the data array.
    self.createSelection = function (type, data) {
        let types = type + "s";
        if (d3.select("svg").select("g." + types).empty()) {
            d3.select("svg").select("g.diagram").append("g")
                .attr("class", types);
        }

        for (let d of data) {
            self.calcLineData(d);
        }

        let updateSel = d3.select("svg").select("g." + types).selectAll("g." + type)
            .data(data, function (d) {
                return d.attributes.getNamedItem("rdf:ID").value;
            });
        let enterSel = updateSel.enter()
            .append("g")
            .attr("class", type)
            .attr("id", function (d) {
                return "cimdiagram-" + d.attributes.getNamedItem("rdf:ID").value;
            });
        return [updateSel, enterSel];
    }

    // Draw all ACLineSegments
    self.drawACLines = function (allACLines) {
        let line = d3.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            });

        let aclineSel = self.createSelection("ACLineSegment", allACLines);
        let aclineUpdate = aclineSel[0];
        let aclineEnter = aclineSel[1];

        aclineEnter.append("path")
            .attr("d", function (d) {
                if (d.lineData.length === 1) {
                    d.lineData.push({
                        x: 150,
                        y: 0,
                        seq: 2
                    });
                }
                return line(d.lineData);
            })
            .attr("fill", "none")
            .attr("stroke", "darkred")
            //.attr("stroke-width", 2);
            .attr("stroke-width", 5);
        aclineEnter.append("text")
            .attr("class", "cim-object-text")
            .attr("font-size", 9);
        updateText(aclineUpdate.select("text"));
        updateText(aclineEnter.select("text"));
        aclineUpdate.select("path")
            .attr("d", function (d) {
                if (d.lineData.length === 1) {
                    d.lineData.push({
                        x: 150,
                        y: 0,
                        seq: 2
                    });
                }
                return line(d.lineData);
            })
            .attr("fill", "none")
            .attr("stroke", "darkred")
            //.attr("stroke-width", 2);
            .attr("stroke-width", 5);

        function updateText(selection) {
            selection.attr("x", function (d) {
                let path = d3.select(this.parentNode).select("path").node();
                return path.getPointAtLength(path.getTotalLength() / 2).x + 2;
            }).attr("y", function (d) {
                let path = d3.select(this.parentNode).select("path").node();
                return path.getPointAtLength(path.getTotalLength() / 2).y - 2;
            }).text(function (d) {
                let name = self.model.getAttribute(d, "cim:IdentifiedObject.name");
                if (typeof (name) !== "undefined") {
                    return name.innerHTML;
                }
                return "";
            });
        };

        return [aclineUpdate, aclineEnter];
    }

    // Draw all Breakers
    self.drawBreakers = function (allBreakers) {
        return self.drawSwitches(allBreakers, "Breaker", "green");
    }

    // Draw all Disconnectors
    self.drawDisconnectors = function (allDisconnectors) {
        return self.drawSwitches(allDisconnectors, "Disconnector", "blue");
    }

    // Draw all load break switches
    self.drawLoadBreakSwitches = function (allLoadBreakSwitches) {
        return self.drawSwitches(allLoadBreakSwitches, "LoadBreakSwitch", "black");
    }

    // Draw all junctions
    self.drawJunctions = function (allJunctions) {
        return self.drawSwitches(allJunctions, "Junction", "red");
    }

    self.drawSwitches = function (allSwitches, type, color) {

        //This function is an accessor fucntion which returns the x, y cordinates from our data
        let line = d3.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
            .curve(d3.curveLinearClosed);

        let swEnter = self.createSelection(type, allSwitches)[1];
        let xStart = (SWITCH_WIDTH / 2) * (-1);
        let xEnd = (SWITCH_WIDTH / 2);
        let yStart = (SWITCH_HEIGHT / 2) * (-1);
        let yEnd = (SWITCH_HEIGHT / 2);

        swEnter.append("path")
            .attr("d", function (d) {
                return line([{
                        x: xStart,
                        y: yStart,
                        seq: 1
                    },
                    {
                        x: xEnd,
                        y: yStart,
                        seq: 2
                    },
                    {
                        x: xEnd,
                        y: yEnd,
                        seq: 3
                    },
                    {
                        x: xStart,
                        y: yEnd,
                        seq: 4
                    }
                ]);
            })
            .attr("fill", function (d) {
                // check the status of this switch
                let measurement = self.model.getTargets(
                    [d],
                    "PowerSystemResource.Measurements")[0];
                let value = self.getDiscreteValue(measurement);
                if (value === "0") {
                    return "white";
                } else {
                    return "black";
                }
            })
            .attr("stroke", color)
            // .attr("stroke-width", 2);
            .attr("stroke-width", 4);
        swEnter.append("text")
            .attr("class", "cim-object-text")
            .style("text-anchor", "end")
            .attr("font-size", 9)
            // .attr("x", -10)
            .attr("x", -20)
            .attr("y", 0)
            .text(function (d) {
                let name = self.model.getAttribute(d, "cim:IdentifiedObject.name");
                if (typeof (name) !== "undefined") {
                    return name.innerHTML;
                }
                return "";
            });
        return swEnter;
    }

    // Draw all EnergySources
    self.drawEnergySources = function (allEnergySources) {
        return self.drawGenerators(allEnergySources, "EnergySource");
    }

    // Draw all SynchronousMachines
    self.drawSynchronousMachines = function (allSynchronousMachines) {
        return self.drawGenerators(allSynchronousMachines, "SynchronousMachine");
    }

    // Draw all AsynchronousMachines
    self.drawAsynchronousMachines = function (allAsynchronousMachines) {
        return self.drawGenerators(allAsynchronousMachines, "AsynchronousMachine");
    }

    // Draw all EnergyConsumers
    self.drawEnergyConsumers = function (allEnergyConsumers) {
        return self.drawLoads(allEnergyConsumers, "EnergyConsumer");
    }

    // Draw all ConformLoads
    self.drawConformLoads = function (allConformLoads) {
        return self.drawLoads(allConformLoads, "ConformLoad");
    }

    // Draw all NonConformLoads
    self.drawNonConformLoads = function (allNonConformLoads) {
        return self.drawLoads(allNonConformLoads, "NonConformLoad");
    }

    // Draw all EquivalentInjections
    self.drawEquivalentInjections = function (allEquivalentInjections) {
        return self.drawLoads(allEquivalentInjections, "EquivalentInjection");
    }

    // Draw all LinearShuntCompensators
    self.drawLinearCompensators = function (allLinearShuntCompensators) {
        return self.drawCompensators(allLinearShuntCompensators, "LinearShuntCompensator");
    }

    // Draw all NonlinearShuntCompensators
    self.drawNonlinearCompensators = function (allNonlinearShuntCompensators) {
        return self.drawCompensators(allNonlinearShuntCompensators, "NonlinearShuntCompensator");
    }

    // Draw all generators
    self.drawGenerators = function (allGens, type) {
        let genEnter = self.createSelection(type, allGens)[1];
        let label = "~";
        let labelSize = 64;
        let labelPos = (GEN_HEIGHT / 2) - 4;
        if (type === "AsynchronousMachine") {
            label = "M";
            labelSize = 32;
            labelPos = (GEN_HEIGHT / 4);
        }

        genEnter.append("circle")
            .attr("r", GEN_HEIGHT / 2)
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("fill", "white")
            .attr("stroke", "blue")
            .attr("stroke-width", 4);
        genEnter.append("text")
            .attr("class", "cim-object-text")
            .style("text-anchor", "middle")
            .attr("font-size", 9)
            .attr("x", 0)
            .attr("y", (GEN_HEIGHT / 2) - 60)
            .text(function (d) {
                let name = self.model.getAttribute(d, "cim:IdentifiedObject.name");
                if (typeof (name) !== "undefined") {
                    return name.innerHTML;
                }
                return "";
            });
        genEnter.append("text")
            .style("text-anchor", "middle")
            .attr("font-size", labelSize)
            .attr("x", 0)
            .attr("y", labelPos)
            .text(label);
        return genEnter;
    }

    // Draw all loads
    self.drawLoads = function (allLoads, type) {
        let line = d3.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
            .curve(d3.curveLinearClosed);
        let loadEnter = self.createSelection(type, allLoads)[1];
        let lx1 = (LOAD_WIDTH / 2) * (-1);
        let lx2 = (LOAD_WIDTH / 2);
        let ly1 = (LOAD_HEIGHT / 2) * (-1);
        let ly2 = (LOAD_HEIGHT / 2);

        loadEnter.append("path")
            .attr("d", function (d) {
                return line([{
                        x: lx1,
                        y: ly1,
                        seq: 1
                    },
                    {
                        x: lx2,
                        y: ly1,
                        seq: 2
                    },
                    {
                        x: (lx2 + lx1) / 2,
                        y: ly2,
                        seq: 3
                    }
                ]);
            })
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 4);
        loadEnter.append("text")
            .attr("class", "cim-object-text")
            .style("text-anchor", "middle")
            .attr("font-size", 9)
            .attr("x", 0)
            .attr("y", ly2 + 10)
            .text(function (d) {
                let name = self.model.getAttribute(d, "cim:IdentifiedObject.name");
                if (typeof (name) !== "undefined") {
                    return name.innerHTML;
                }
                return "";
            });
        return loadEnter;
    }

    // Draw all compensators
    self.drawCompensators = function (allCompensators, type) {
        let line = d3.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            });
        let compEnter = self.createSelection(type, allCompensators)[1];
        let cx1 = (COMP_WIDTH / 2) * (-1);
        let cx2 = (COMP_WIDTH / 2);
        let cy1 = (COMP_HEIGHT / 2) * (-1) * 0.4;
        let cy2 = (COMP_HEIGHT / 2) * 0.4;
        let ty1 = (TERMINAL_OFFSET + (COMP_HEIGHT / 2)) * (-1);
        let ty2 = (TERMINAL_OFFSET + (COMP_HEIGHT / 2));

        compEnter.append("path")
            .attr("d", function (d) {
                return line([{
                        x: 0,
                        y: ty1,
                        seq: 1
                    },
                    {
                        x: 0,
                        y: cy1,
                        seq: 2
                    }
                ]);
            })
            .attr("fill", "white")
            .attr("stroke", "black")
            // .attr("stroke-width", 1);
            .attr("stroke-width", 2);
        compEnter.append("path")
            .attr("d", function (d) {
                return line([{
                        x: 0,
                        y: cy2,
                        seq: 1
                    },
                    {
                        x: 0,
                        y: ty2,
                        seq: 2
                    }
                ]);
            })
            .attr("fill", "white")
            .attr("stroke", "black")
            // .attr("stroke-width", 1);
            .attr("stroke-width", 2);
        compEnter.append("path")
            .attr("d", function (d) {
                return line([{
                        x: cx1,
                        y: cy1,
                        seq: 1
                    },
                    {
                        x: cx2,
                        y: cy1,
                        seq: 2
                    }
                ]);
            })
            .attr("fill", "white")
            .attr("stroke", "black")
            // .attr("stroke-width", 4);
            .attr("stroke-width", 6);
        compEnter.append("path")
            .attr("d", function (d) {
                return line([{
                        x: cx1,
                        y: cy2,
                        seq: 1
                    },
                    {
                        x: cx2,
                        y: cy2,
                        seq: 2
                    }
                ]);
            })
            .attr("fill", "white")
            .attr("stroke", "black")
            // .attr("stroke-width", 4);
            .attr("stroke-width", 6);
        compEnter.append("text")
            .attr("class", "cim-object-text")
            .style("text-anchor", "middle")
            .attr("font-size", 9)
            .attr("x", 0)
            .attr("y", ty2 + 10)
            .text(function (d) {
                let name = self.model.getAttribute(d, "cim:IdentifiedObject.name");
                if (typeof (name) !== "undefined") {
                    return name.innerHTML;
                }
                return "";
            });
        return compEnter;
    }

    // Draw all PowerTransformers
    self.drawPowerTransformers = function (allPowerTransformers) {
        let trafoEnter = this.createSelection("PowerTransformer", allPowerTransformers)[1];
        let wind1y = TRAFO_RADIUS - (TRAFO_HEIGHT / 2);
        let wind2y = (TRAFO_HEIGHT / 2) - TRAFO_RADIUS;

        let twoWind = trafoEnter.filter(function (d) {
            let winds = self.model.getTargets([d], "PowerTransformer.PowerTransformerEnd");
            return winds.length === 2;
        });
        let threeWind = trafoEnter.filter(function (d) {
            let winds = self.model.getTargets([d], "PowerTransformer.PowerTransformerEnd");
            return winds.length === 3;
        });

        twoWind.append("circle")
            .attr("r", TRAFO_RADIUS)
            .attr("cx", 0)
            .attr("cy", wind2y)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 4);
        threeWind.append("circle")
            .attr("r", TRAFO_RADIUS)
            .attr("cx", (TRAFO_RADIUS / 2) * (-1))
            .attr("cy", wind2y)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 4);
        threeWind.append("circle")
            .attr("r", TRAFO_RADIUS)
            .attr("cx", (TRAFO_RADIUS / 2))
            .attr("cy", wind2y)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 4);

        twoWind.append("g")
            .attr("class", "TransformerEnd")
            .append("circle")
            .attr("r", TRAFO_RADIUS)
            .attr("cx", 0)
            .attr("cy", wind1y)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 4)
            .attr("class", "TransformerEndCircle");
        twoWind.append("g")
            .attr("class", "TransformerEnd")
            .append("circle")
            .attr("r", TRAFO_RADIUS)
            .attr("cx", 0)
            .attr("cy", wind2y)
            .attr("fill", "white")
            .attr("fill-opacity", "0")
            .attr("stroke", "black")
            .attr("stroke-width", 4)
            .attr("class", "TransformerEndCircle");
        threeWind.append("g")
            .attr("class", "TransformerEnd")
            .append("circle")
            .attr("r", TRAFO_RADIUS)
            .attr("cx", 0)
            .attr("cy", wind1y)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 4)
            .attr("class", "TransformerEndCircle");
        threeWind.append("g")
            .attr("class", "TransformerEnd")
            .append("circle")
            .attr("r", TRAFO_RADIUS)
            .attr("cx", (TRAFO_RADIUS / 2) * (-1))
            .attr("cy", wind2y)
            .attr("fill", "white")
            .attr("fill-opacity", "0")
            .attr("stroke", "black")
            .attr("stroke-width", 4)
            .attr("class", "TransformerEndCircle");
        threeWind.append("g")
            .attr("class", "TransformerEnd")
            .append("circle")
            .attr("r", TRAFO_RADIUS)
            .attr("cx", (TRAFO_RADIUS / 2))
            .attr("cy", wind2y)
            .attr("fill", "white")
            .attr("fill-opacity", "0")
            .attr("stroke", "black")
            .attr("stroke-width", 4)
            .attr("class", "TransformerEndCircle");

        trafoEnter.append("text")
            .attr("class", "cim-object-text")
            .style("text-anchor", "end")
            .attr("font-size", 9)
            .attr("x", (TRAFO_HEIGHT / 2) * (-1))
            .attr("y", (TRAFO_HEIGHT / 2))
            .text(function (d) {
                let name = self.model.getAttribute(d, "cim:IdentifiedObject.name");
                if (typeof (name) !== "undefined") {
                    return name.innerHTML;
                }
                return "";
            });

        return trafoEnter;
    }

    self.handlePowerTransformerEnds = function (termNode) {
        let term = d3.select(termNode).datum();
        let eq = d3.select(termNode.parentNode).datum();
        let minDist2 = null;
        let circleSel = null;
        let trafoEnd = self.model.getTargets([term], "Terminal.TransformerEnd");
        let termX = term.x - eq.x;
        let termY = term.y - eq.y;
        let circles = d3.select(termNode.parentNode).selectAll(":scope > g.TransformerEnd").each(function () {
            let cx = parseInt(d3.select(this).select(":scope > circle.TransformerEndCircle").attr("cx"));
            let cy = parseInt(d3.select(this).select(":scope > circle.TransformerEndCircle").attr("cy"));
            let dist2 = ((cx - termX) ** 2) + ((cy - termY) ** 2);
            if (minDist2 === null || minDist2 > dist2) {
                minDist2 = dist2;
                circleSel = d3.select(this);
            }
        });
        circleSel.data(trafoEnd);
        circleSel.attr("id", function () {
            return "cimdiagram-" + trafoEnd[0].attributes.getNamedItem("rdf:ID").value;
        });
    }

    // Adds terminals to the objects contained in the selection.
    // The elements must all be of the same type (e.g. switches, loads...).
    // This function is quite complicated because we want to draw terminals
    // in the "correct" place, i.e. as close as possible to the
    // associated bus.
    self.createTerminals = function (eqSelection) {
        let term1_cy = 0; // default y coordinate for first terminal
        let term2_cy = 30; // default y coordinate for second terminal (if present)
        let objType = "none";
        if (eqSelection.size() > 0) {
            objType = eqSelection.data()[0].nodeName;
        }
        // use the correct height for the element
        switch (objType) {
            case "cim:Breaker":
            case "cim:Disconnector":
            case "cim:LoadBreakSwitch":
                term1_cy = ((SWITCH_HEIGHT / 2) + (TERMINAL_RADIUS + TERMINAL_OFFSET)) * (-1);
                term2_cy = (SWITCH_HEIGHT / 2) + (TERMINAL_RADIUS + TERMINAL_OFFSET);
                break;
            case "cim:EnergySource":
            case "cim:SynchronousMachine":
            case "cim:AsynchronousMachine":
                term1_cy = ((GEN_HEIGHT / 2) + (TERMINAL_RADIUS + TERMINAL_OFFSET)) * (-1);
                break;
            case "cim:EnergyConsumer":
            case "cim:ConformLoad":
            case "cim:NonConformLoad":
            case "cim:EquivalentInjection":
                term1_cy = ((LOAD_HEIGHT / 2) + (TERMINAL_RADIUS + TERMINAL_OFFSET)) * (-1);
                break;
            case "cim:PowerTransformer":
                term1_cy = ((TRAFO_HEIGHT / 2) + (TERMINAL_RADIUS + TERMINAL_OFFSET)) * (-1);
                term2_cy = (TRAFO_HEIGHT / 2) + (TERMINAL_RADIUS + TERMINAL_OFFSET);
                break;
            case "cim:LinearShuntCompensator":
            case "cim:NonlinearShuntCompensator":
                term1_cy = ((COMP_HEIGHT / 2) + (TERMINAL_RADIUS + TERMINAL_OFFSET)) * (-1);
                break;
            default:
                term2_cy = 30;
        }
        let allEdges = [];
        let updateTermSelection = eqSelection
            .selectAll("g.Terminal")
            .data(function (d) {
                return self.model.getTerminals([d]);
            });
        let termSelection = updateTermSelection
            .enter()
            .append("g")
            .each(function (d, i) {
                let cn = self.model.getTargets(
                    [d],
                    TERM_NODE)[0];
                let lineData = d3.select(this.parentNode).datum().lineData;
                let start = lineData[0];
                let end = lineData[lineData.length - 1];
                let eqX = d3.select(this.parentNode).datum().x;
                let eqY = d3.select(this.parentNode).datum().y;
                if (lineData.length === 1) {
                    start = {
                        x: 0,
                        y: term1_cy
                    };
                    end = {
                        x: 0,
                        y: term2_cy
                    };
                }

                let eqRot = d3.select(this.parentNode).datum().rotation;
                let terminals = self.model.getTerminals(d3.select(this.parentNode).data());
                // decide where to put terminals. TODO: should handle
                // an arbitrary number of terminals, not only two.
                if (typeof (cn) !== "undefined" && terminals.length === 2) {
                    let dist1 = 0;
                    let dist2 = 0;
                    // handle rotation
                    if (eqRot > 0) {
                        let startRot = self.rotate(start, eqRot);
                        let endRot = self.rotate(end, eqRot);
                        dist1 = Math.pow((eqX + startRot.x - cn.x), 2) + Math.pow((eqY + startRot.y - cn.y), 2);
                        dist2 = Math.pow((eqX + endRot.x - cn.x), 2) + Math.pow((eqY + endRot.y - cn.y), 2);
                    } else {
                        dist1 = Math.pow((eqX + start.x - cn.x), 2) + Math.pow((eqY + start.y - cn.y), 2);
                        dist2 = Math.pow((eqX + end.x - cn.x), 2) + Math.pow((eqY + end.y - cn.y), 2);
                    }

                    if (dist2 < dist1) {
                        d.x = eqX + end.x;
                        d.y = eqY + end.y;
                    } else {
                        d.x = eqX + start.x;
                        d.y = eqY + start.y;
                    }
                    // be sure we don't put two terminals on the same side of the equipment
                    checkTerminals(terminals, d, cn, eqX, eqY, start, end);
                } else {
                    if (lineData.length === 1) {
                        d.x = eqX;
                        // here we have a special case for three-winding transformers
                        if (terminals.length === 3) {
                            if (i === 0) {
                                d.y = eqY + term1_cy;
                            }
                            if (i === 1) {
                                d.x = d.x - (TRAFO_RADIUS / 2);
                                d.y = eqY + term2_cy;
                            }
                            if (i === 2) {
                                d.x = d.x + (TRAFO_RADIUS / 2);
                                d.y = eqY + term2_cy;
                            }

                        } else {
                            d.y = eqY + term1_cy * (1 - i) + term2_cy * i;
                        }
                    } else {
                        d.x = eqX + start.x * (1 - i) + end.x * i;
                        d.y = eqY + start.y * (1 - i) + end.y * i;
                    }
                }
                d.rotation = d3.select(this.parentNode).datum().rotation;
                if (typeof (cn) !== "undefined" && typeof (cn.lineData) !== "undefined") {
                    let newEdge = {
                        source: cn,
                        target: d
                    };
                    allEdges.push(newEdge);
                }
                // Now that terminal are allocated, we can handle power transformer ends
                if (objType === "cim:PowerTransformer") {
                    self.handlePowerTransformerEnds(this);
                }
            })
            .attr("id", function (d) {
                return "cimdiagram-" + d.attributes.getNamedItem("rdf:ID").value;
            })
            .attr("class", function (d) {
                return d.localName;
            });
        self.createEdges(allEdges);
        termSelection.append("circle")
            .attr("r", TERMINAL_RADIUS)
            .style("fill", "black")
            .attr("cx", function (d, i) {
                return d3.select(this.parentNode).datum().x - d3.select(this.parentNode.parentNode).datum().x;
            })
            .attr("cy", function (d, i) {
                return d3.select(this.parentNode).datum().y - d3.select(this.parentNode.parentNode).datum().y;
            });
        updateTermSelection
            .each(function (d, i) {
                let eqX = d3.select(this.parentNode).datum().x;
                let eqY = d3.select(this.parentNode).datum().y;
                let offsetx = parseInt(d3.select(this.firstChild).attr("cx"));
                let offsety = parseInt(d3.select(this.firstChild).attr("cy"));
                if (offsetx === 0 && offsety === 0) {
                    d.x = eqX;
                    d.y = eqY;
                } else {
                    let lineData = d3.select(this.parentNode).datum().lineData;
                    let end = lineData[lineData.length - 1];
                    d.x = eqX + end.x;
                    d.y = eqY + end.y;
                }
            });
        updateTermSelection.selectAll("circle")
            .attr("cx", function (d, i) {
                return d3.select(this.parentNode).datum().x - d3.select(this.parentNode.parentNode).datum().x;
            })
            .attr("cy", function (d, i) {
                return d3.select(this.parentNode).datum().y - d3.select(this.parentNode.parentNode).datum().y;
            });

        function checkTerminals(terminals, d, cn, eqX, eqY, start, end) {
            let otherTerm = terminals.filter(term => term !== d)[0];
            // we need to check if the other terminal must be moved
            let otherCn = self.model.getTargets(
                [otherTerm],
                TERM_NODE)[0];
            let termToChange = otherTerm;
            let cnToChange = otherCn;
            if (typeof (otherCn) !== "undefined") {
                let equipments = self.model.getEquipments(otherCn);
                if (equipments.length > 1) {
                    termToChange = d;
                    cnToChange = cn;
                }
            }

            if (otherTerm.x === d.x && otherTerm.y === d.y) {
                if (d.x === eqX + end.x && d.y === eqY + end.y) {
                    termToChange.x = eqX + start.x;
                    termToChange.y = eqY + start.y;
                } else {
                    termToChange.x = eqX + end.x;
                    termToChange.y = eqY + end.y;
                }
            }
        }

        // highlight the terminals on mouseover, since they are quite small
        termSelection.each(function () {
            let term = d3.select(this).select("circle");
            d3.select(this).append("circle")
                .attr("cx", term.attr("cx"))
                .attr("cy", term.attr("cy"))
                // .attr("r", 6)
                .attr("r", 9)
                .attr("stroke-width", 0)
                .attr("fill", "steelblue")
                .attr("fill-opacity", "0.0")
                .attr("class", "big-circle").on("mouseout", function (d) {
                    d3.select(this).attr("fill-opacity", "0.0");
                });
        });
        termSelection.on("mouseover", function (d) {
            if (d3.select(this).select("circle.selection-circle").size() === 0) {
                d3.select(this).select("circle.big-circle").attr("fill-opacity", "0.7");
            }
        });

        return termSelection;
    }

    self.calcLineData = function (d) {
        d.x = undefined;
        d.y = undefined;
        d.rotation = 0;
        let lineData = [];
        let xcalc = 0;
        let ycalc = 0;
        // extract equipments
        // filter by lineData, because there may be some elements which are on the diagram but we don't draw
        let equipments = self.model.getEquipments(d).filter(el => typeof (el.lineData) !== "undefined" || el.localName === "BusbarSection");
        // let's try to get a busbar section
        let busbarSection = equipments.filter(el => el.localName === "BusbarSection")[0];
        let dobjs = self.model.getDiagramObjects([d]);
        if (dobjs.length === 0) {
            if (typeof (busbarSection) !== "undefined") {
                dobjs = self.model.getDiagramObjects([busbarSection]);
                let rotation = self.model.getAttribute(dobjs[0], "cim:DiagramObject.rotation");
                if (typeof (rotation) !== "undefined") {
                    d.rotation = parseInt(rotation.innerHTML);
                }
            } else if (equipments.length > 0) {
                let points = [];
                for (let eq of equipments) {
                    let endx = eq.x + eq.lineData[eq.lineData.length - 1].x;
                    let endy = eq.y + eq.lineData[eq.lineData.length - 1].y;
                    points.push({
                        x: eq.x + eq.lineData[0].x,
                        y: eq.y + eq.lineData[0].y,
                        eq: eq
                    }, {
                        x: endx,
                        y: endy,
                        eq: eq
                    });
                }
                let min = Infinity;
                let p1min = points[0],
                    p2min = points[0];
                for (let p1 of points) {
                    for (let p2 of points) {
                        if (p1.eq === p2.eq) {
                            continue;
                        }
                        let dist = self.distance2(p1, p2);
                        if (dist < min) {
                            min = dist;
                            p1min = p1;
                            p2min = p2;
                        }
                    }
                }
                xcalc = (p1min.x + p2min.x) / 2;
                ycalc = (p1min.y + p2min.y) / 2;
            }
        } else {
            let rotation = self.model.getAttribute(dobjs[0], "cim:DiagramObject.rotation");
            if (typeof (rotation) !== "undefined") {
                d.rotation = parseInt(rotation.innerHTML);
            }
        }
        let points = self.model.getTargets(
            dobjs,
            "DiagramObject.DiagramObjectPoints");
        if (points.length > 0) {
            for (let point of points) {
                let seqNum = self.model.getAttribute(point, "cim:DiagramObjectPoint.sequenceNumber");
                if (typeof (seqNum) === "undefined") {
                    seqNum = 1;
                } else {
                    seqNum = parseInt(seqNum.innerHTML);
                }
                lineData.push({
                    x: parseFloat(self.model.getAttribute(point, "cim:DiagramObjectPoint.xPosition").innerHTML),
                    y: parseFloat(self.model.getAttribute(point, "cim:DiagramObjectPoint.yPosition").innerHTML),
                    seq: seqNum
                });
            }
            lineData.sort(function (a, b) {
                return a.seq - b.seq
            });
            d.x = lineData[0].x;
            d.y = lineData[0].y;
            // relative values
            for (let point of lineData) {
                point.x = point.x - d.x;
                point.y = point.y - d.y;
            }
        } else {
            lineData.push({
                x: 0,
                y: 0,
                seq: 1
            });
            // special case: if this is a node with a busbar associated, we draw it as
            // a two-dimensional object
            if (d.nodeName === "cim:" + NODE_CLASS) {
                let terminals = self.model.getTargets(
                    [d],
                    NODE_TERM);
                // let's try to get some equipment
                let equipments = self.model.getTargets(
                    terminals,
                    "Terminal.ConductingEquipment");
                let busbar = equipments.filter(
                    el => el.nodeName === "cim:BusbarSection")[0];
                if (typeof (busbar) !== "undefined") {
                    lineData.push({
                        x: 150,
                        y: 0,
                        seq: 2
                    });
                }
            }
            d.x = xcalc;
            d.y = ycalc;
            self.model.addToActiveDiagram(d, lineData);
        }
        d.lineData = lineData;

        return lineData;
    }

    // Draw all nodes (connectivity or topological)
    self.drawNodes = function (allNodes) {
        let line = d3.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            });

        for (let cn of allNodes) {
            self.calcLineData(cn);
            // special rule: if the connectivuty node has more than one point
            // (i.e. it is drawn like a linear object) then we force it to have
            // an associated busbar.
            /*
            let busbar = self.model.getBusbar(cn);
            if (cn.lineData.length > 1 && busbar === null) {
                let newObj = self.model.createObject("cim:BusbarSection", {node: cn});
                let name = self.model.getAttribute(cn, "cim:IdentifiedObject.name");
                if (typeof(name) !== "undefined") {
                    self.model.setAttribute(newObj, "cim:IdentifiedObject.name", name.innerHTML);
                }
            }
            */
        }

        if (d3.select("svg").select("g." + NODE_CLASS + "s").empty()) {
            d3.select("svg").select("g.diagram").append("g")
                .attr("class", NODE_CLASS + "s");
        }

        let cnUpdate = d3.select("svg")
            .select("g." + NODE_CLASS + "s")
            .selectAll("g." + NODE_CLASS)
            .data(allNodes, function (d) {
                return d.attributes.getNamedItem("rdf:ID").value;
            });

        let cnEnter = cnUpdate.enter()
            .append("g")
            .attr("class", NODE_CLASS)
            .attr("id", function (d) {
                return "cimdiagram-" + d.attributes.getNamedItem("rdf:ID").value;
            });

        cnUpdate.select("path").attr("d", function (d) {
            let lineData = d3.select(this.parentNode).data()[0].lineData
            return line(lineData);
        });

        cnEnter.append("path")
            .attr("d", function (d) {
                let lineData = d3.select(this.parentNode).data()[0].lineData
                return line(lineData);
            })
            .attr("stroke", "black")
            //.attr("stroke-width", 2);
            .attr("stroke-width", 5)
            .attr("fill", "none");

        // for busbars, show the name
        cnEnter
            .filter(function (d) {
                let busbarSection = self.model.getBusbar(d);
                return (busbarSection !== null);
            }).append("text")
            .attr("class", "cim-object-text")
            .attr("font-size", 9);
        updateText(cnEnter.select("text"));
        updateText(cnUpdate.select("text"));

        function updateText(selection) {
            selection.attr("x", function (d) {
                let path = d3.select(this.parentNode).select("path").node();
                return path.getPointAtLength(path.getTotalLength() / 2).x + 2;
            }).attr("y", function (d) {
                let path = d3.select(this.parentNode).select("path").node();
                return path.getPointAtLength(path.getTotalLength() / 2).y - 2;
            }).text(function (d) {
                // let's try to get a busbar section
                let busbarSection = self.model.getBusbar(d);
                if (busbarSection !== null) {
                    let name = self.model.getAttribute(busbarSection, "cim:IdentifiedObject.name");
                    if (typeof (name) !== "undefined") {
                        return name.innerHTML;
                    }
                }
                return "";
            })
        };

        return cnEnter;
    }

    self.moveTo = function (uuid) {
        let hoverD = self.model.getObject(uuid);
        if (typeof (hoverD) === "undefined") {
            return;
        }
        // handle busbars
        if (hoverD.nodeName === "cim:BusbarSection") {
            hoverD = self.model.getNode(hoverD);
        }

        // handle substations and lines
        if (hoverD.nodeName === "cim:Substation" ||
            hoverD.nodeName === "cim:Line") {
            let equipments = self.model.getTargets(
                [hoverD],
                "EquipmentContainer.Equipments");
            for (let equipment of equipments) {
                // handle busbars
                if (equipment.nodeName === "cim:BusbarSection") {
                    let cn = self.model.getNode(equipment);
                    if (cn !== null) {
                        equipment = cn;
                    }
                }
                if (typeof (equipment.x) !== "undefined" && typeof (equipment.y) !== "undefined") {
                    hoverD.x = equipment.x;
                    hoverD.y = equipment.y;
                    break;
                }
            }
        }
        // handle measurements
        if (hoverD.nodeName === "cim:Analog" ||
            hoverD.nodeName === "cim:Discrete") {
            hoverD = self.model.getTargets(
                [hoverD],
                "Measurement.PowerSystemResource")[0];
            if (typeof (hoverD) !== "undefined") {
                // handle busbars
                if (hoverD.nodeName === "cim:BusbarSection") {
                    hoverD = self.model.getNode(hoverD);
                }
            }
        }
        // handle power transformer ends
        if (hoverD.nodeName === "cim:PowerTransformerEnd") {
            hoverD = self.model.getTargets(
                [hoverD],
                "PowerTransformerEnd.PowerTransformer")[0];
        }

        if (typeof (hoverD.x) === "undefined" || typeof (hoverD.y) === "undefined") {
            return;
        }
        // hide popover before moving
        $('[data-toggle="popover"]').popover("hide");
        // do the transform
        let svgWidth = parseInt(d3.select("svg").style("width"));
        let svgHeight = parseInt(d3.select("svg").style("height"));
        let newZoom = 1;
        let newx = -hoverD.x * newZoom + (svgWidth / 2);
        let newy = -hoverD.y * newZoom + (svgHeight / 2);
        // apply a transition to the moving
        let trans = d3.transition()
            .duration(750)
            .ease(d3.easeLinear);
        let t = d3.zoomIdentity.translate(newx, newy).scale(1);
        d3.selectAll("svg").select("g.diagram").transition(trans).attr("transform", t);
        d3.zoom().transform(d3.selectAll("svg"), t);
        self.trigger("transform");
    }

    /** Calculate the closest point on a given busbar relative to a given point (a terminal) */
    self.closestPoint = function (source, point) {
        let line = d3.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            });

        let pathNode = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'svg')).append("path").attr("d", line(source.lineData)).node();

        if (pathNode === null) {
            return [0, 0];
        }

        let pathLength = pathNode.getTotalLength(),
            precision = 8,
            best,
            bestLength,
            bestDistance = Infinity;

        if (pathLength === 0) {
            return [0, 0];
        }

        if (typeof (point.x) === "undefined" || typeof (point.y) === "undefined") {
            return [0, 0];
        }

        // linear scan for coarse approximation
        for (let scanLength = 0; scanLength <= pathLength; scanLength += precision) {
            let scan = pathNode.getPointAtLength(scanLength);
            if (source.rotation !== 0) {
                scan = self.rotate(scan, source.rotation);
            }
            let scanDistance = distance2(scan);
            if (scanDistance < bestDistance) {
                best = scan;
                bestLength = scanLength;
                bestDistance = scanDistance;
            }
        }

        // binary search for precise estimate
        precision /= 2;
        while (precision > 0.5) {
            let beforeLength = bestLength - precision;
            if (beforeLength >= 0) {
                let before = pathNode.getPointAtLength(beforeLength);
                if (source.rotation !== 0) {
                    before = self.rotate(before, source.rotation);
                }
                let beforeDistance = distance2(before);

                if (beforeDistance < bestDistance) {
                    best = before;
                    bestLength = beforeLength;
                    bestDistance = beforeDistance;
                    continue;
                }
            }
            let afterLength = bestLength + precision;
            if (afterLength <= pathLength) {
                let after = pathNode.getPointAtLength(afterLength);
                if (source.rotation !== 0) {
                    after = self.rotate(after, source.rotation);
                }
                let afterDistance = distance2(after);
                if (afterDistance < bestDistance) {
                    best = after;
                    bestLength = afterLength;
                    bestDistance = afterDistance;
                    continue;
                }
            }
            precision /= 2;
        }

        best = [best.x, best.y];
        return best;

        function distance2(p) {
            let dx = p.x + source.x - point.x,
                dy = p.y + source.y - point.y;
            return dx * dx + dy * dy;
        }
    }

    /** Update the diagram based on x and y values of data */
    self.forceTick = function (selection) {
        if (arguments.length === 0 || selection.alpha !== undefined) {
            // update everything
            selection = d3.select("svg").selectAll("svg > g.diagram > g:not(.edges) > g");
        }

        let transform = d3.zoomTransform(d3.select("svg").node());
        let xoffset = transform.x;
        let yoffset = transform.y;
        let svgZoom = transform.k;
        updateElements(selection);

        if (arguments.length === 1) {
            let terminals = self.model.getTerminals(selection.data());
            let links = d3.select("svg").selectAll("svg > g.diagram > g.edges > g").filter(function (d) {
                return selection.data().indexOf(d.source) > -1 || terminals.indexOf(d.target) > -1;
            });
            self.updateEdges(xoffset, yoffset, svgZoom, links);
        } else {
            self.updateEdges(xoffset, yoffset, svgZoom);
        }

        function updateElements(selection) {
            selection.attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ") rotate(" + d.rotation + ")";
                }).selectAll("g.Terminal")
                .each(function (d, i) {
                    d.x = d3.select(this.parentNode).datum().x + parseInt(d3.select(this.firstChild).attr("cx"));
                    d.y = d3.select(this.parentNode).datum().y + parseInt(d3.select(this.firstChild).attr("cy"));
                });
            // if rotation is a multiple of 180, undo it (for readability)
            selection.selectAll("text.cim-object-text")
                .attr("transform", function (d) {
                    let textRotation = 0;
                    let rotationOrigin = {
                        x: 0,
                        y: 0
                    };
                    if ((d.rotation % 360) === 180) {
                        textRotation = d.rotation * (-1);
                    }
                    switch (d.nodeName) {
                        case "cim:Breaker":
                        case "cim:Disconnector":
                        case "cim:LoadBreakSwitch":
                        case "cim:Junction":
                            rotationOrigin = {
                                x: 0,
                                y: 0
                            };
                            break;
                        case "cim:PowerTransformer":
                            rotationOrigin = {
                                x: 0,
                                y: 30
                            }; // TODO: define this constant
                            break;
                        default:
                            rotationOrigin = {
                                x: d3.select(this).attr("x"),
                                y: d3.select(this).attr("y")
                            };
                            break;
                    }
                    return "rotate(" + textRotation + "," + rotationOrigin.x + "," + rotationOrigin.y + ")";
                });
            selection.selectAll("rect.selection-rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 0)
                .attr("height", 0);
            selection.selectAll("rect.selection-rect")
                .attr("x", function (d) {
                    return this.parentNode.getBBox().x
                })
                .attr("y", function (d) {
                    return this.parentNode.getBBox().y
                })
                .attr("width", function (d) {
                    return this.parentNode.getBBox().width;
                })
                .attr("height", function (d) {
                    return this.parentNode.getBBox().height;
                });
            selection.selectAll("g.resize").selectAll("rect")
                .attr("x", function (d) {
                    let p = d[0].lineData.filter(el => el.seq === d[1])[0];
                    return p.x - 2;
                })
                .attr("y", function (d) {
                    let p = d[0].lineData.filter(el => el.seq === d[1])[0];
                    return p.y - 2;
                });
        };
    }

    self.addToDiagram = function (object) {
        let m = d3.mouse(d3.select("svg").node());
        let transform = d3.zoomTransform(d3.select("svg").node());
        let xoffset = transform.x;
        let yoffset = transform.y;
        let svgZoom = transform.k;
        object.x = (m[0] - xoffset) / svgZoom;
        object.px = object.x;
        object.y = (m[1] - yoffset) / svgZoom;
        object.py = object.y;

        let lineData = [{
            x: 0,
            y: 0,
            seq: 1
        }]; // always OK except acline and busbar
        if (object.nodeName === "cim:ACLineSegment" || object.nodeName === "cim:BusbarSection") {
            lineData.push({
                x: 150,
                y: 0,
                seq: 2
            });
        }

        self.model.addToActiveDiagram(object, lineData);
    }

    /** Update the given links. If links is absent, update all links */
    self.updateEdges = function (xoffset, yoffset, svgZoom, links) {
        let line = d3.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
            .curve(d3.curveStepBefore);
        if (arguments.length === 3) {
            links = d3.select("svg").selectAll("svg > g.diagram > g.edges > g");
        }

        links.select("path")
            .attr("d", function (d) {
                let cnXY = {
                    x: d.source.x,
                    y: d.source.y
                };
                let terminalXY = {
                    x: d.target.x,
                    y: d.target.y
                };
                if (d.target.rotation !== 0) {
                    terminalXY = self.rotateTerm(d.target);
                }

                // if the node is not a single point (e.g. it is a busbar)
                // then we calculate the optimal position of the connection
                // towards the terminal.
                if (d.source.lineData.length > 1) {
                    d.p = self.closestPoint(d.source, terminalXY);
                } else {
                    d.p = [0, 0];
                }

                cnXY.x = cnXY.x + d.p[0];
                cnXY.y = cnXY.y + d.p[1];
                let lineData = [cnXY, terminalXY];
                return line(lineData);
            }).attr("stroke-dasharray", function (d) {
                let connected = self.model.getAttribute(d.target, "cim:ACDCTerminal.connected");
                if (typeof (connected) !== "undefined") {
                    if (connected.textContent === "false") {
                        return "5, 5";
                    }
                }
                return null;
            });
        // test
        /*links.each(function(d) {
            let pathDs = [];
            let cn = d.source;
            let cnLinks = d3
                .select("svg")
                .selectAll("svg > g.diagram > g.edges > g")
                .filter(d => d.source === cn);
            let paths = cnLinks.selectAll("path");
            paths.each(function(d) {
                pathDs.push(d3.select(this).attr("d"));
            });
            console.log(pathDs);
            for (let pathD of pathDs) {
                console.log(pathD.substring(1).split("L"));
            }
        })*/
    }

    self.rotateTerm = function (term) {
        let equipment = self.model.getTargets(
            [term],
            "Terminal.ConductingEquipment")[0];
        let baseX = equipment.x;
        let baseY = equipment.y;
        let cRot = self.rotate({
            x: term.x - baseX,
            y: term.y - baseY
        }, term.rotation);
        let newX = baseX + cRot.x;
        let newY = baseY + cRot.y;
        return {
            x: newX,
            y: newY
        };
    }

    /** rotate a point of a given amount (in degrees) */
    self.rotate = function (p, rotation) {
        let svgroot = d3.select("svg").node();
        let pt = svgroot.createSVGPoint();
        pt.x = p.x;
        pt.y = p.y;
        if (rotation === 0) {
            return pt;
        }
        let rotate = svgroot.createSVGTransform();
        rotate.setRotate(rotation, 0, 0);
        return pt.matrixTransform(rotate.matrix);
    }

    self.distance2 = function (p1, p2) {
        let dx = p1.x - p2.x,
            dy = p1.y - p2.y;
        return dx * dx + dy * dy;
    }

    // draw the diagram grid
    self.drawGrid = function (zoom) {
        let width = parseInt(d3.select("svg").style("width")) / zoom;
        let height = parseInt(d3.select("svg").style("height")) / zoom;
        let gridG = d3.select("svg").select("g.diagram-grid");
        gridG.selectAll("*").remove();
        const spacing = 25;
        for (let j = spacing; j <= height - spacing; j = j + spacing) {
            gridG.append("svg:line")
                .attr("x1", 0)
                .attr("y1", j)
                .attr("x2", width)
                .attr("y2", j)
                .attr("stroke-dasharray", "1, 5")
                .style("stroke", "rgb(6,120,155)")
                .style("stroke-width", 1);
        };
        for (let j = spacing; j <= width - spacing; j = j + spacing) {
            gridG.append("svg:line")
                .attr("x1", j)
                .attr("y1", 0)
                .attr("x2", j)
                .attr("y2", height)
                .attr("stroke-dasharray", "1, 5")
                .style("stroke", "rgb(6,120,155)")
                .style("stroke-width", 1);
        };
        gridG.attr("transform", "scale(" + zoom + ")");
    }

}