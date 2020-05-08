"use strict";

function cimTreeTag(opts) {

    let self = this;

    this.model = opts.model;

    let mode = "default";
    let menu = d3.contextMenu([{
        title: 'Delete',
        action: function (d, i) {
            opts.model.deleteObject(d);
        }
    }]);

    let searchResults = null;

    self.on("mount", function () {
        $("form").submit(function (event) {
            event.preventDefault();
        });
        // setup search input field
        $("#cim-search-key").on("keyup", function (event) {
            if (event.key === "Enter") {
                // check if we are case-sensitive
                let caseSensitive = $("#cim-search-case").hasClass("active");
                let searchKey = document.getElementById("cim-search-key").value;
                if (searchKey === "") {
                    $("#cim-search-results", self.root).addClass("d-none");
                    searchResults = null;
                } else {
                    let total = [];
                    $("ul:not(.CIM-object-list)", self.root).each(function () {
                        let matches = null;
                        if (caseSensitive === true) {
                            matches = $(this).find("li.CIM-object>button.cim-object-btn:contains(" + searchKey + ")");
                        } else {
                            matches = $(this).find("li.CIM-object>button.cim-object-btn").filter(function (i, el) {
                                let searchString = searchKey.toLocaleLowerCase();
                                let target = $(this).html().toLocaleLowerCase();
                                return (target.indexOf(searchString) >= 0);
                            });
                        }
                        total = total.concat(matches.get());
                    });
                    total = [...new Set(total)];
                    $("#cim-search-results", self.root).removeClass("d-none");
                    if (total.length > 0) {
                        $("#cim-search-results > span", self.root).html("Result 1 of " + total.length);
                        searchResults = {
                            elements: d3.selectAll(total).data(),
                            actualResult: 0
                        };
                        self.moveTo(searchResults.elements[searchResults.actualResult].attributes.getNamedItem("rdf:ID").value);
                    } else {
                        $("#cim-search-results > span", self.root).html("Text not found");
                    }
                }
            }
        });
        // setup search buttons
        $("#cim-search-next").on("click", function () {
            if (searchResults !== null) {
                if (searchResults.actualResult < (searchResults.elements.length - 1)) {
                    searchResults.actualResult = searchResults.actualResult + 1;
                    let result = searchResults.actualResult + 1;
                    $("#cim-search-results > span", self.root).html("Result " + result + " of " + searchResults.elements.length);
                    self.moveTo(searchResults.elements[searchResults.actualResult].attributes.getNamedItem("rdf:ID").value);
                }
            }
        });
        $("#cim-search-prev").on("click", function () {
            if (searchResults !== null) {
                if (searchResults.actualResult > 0) {
                    searchResults.actualResult = searchResults.actualResult - 1;
                    let result = searchResults.actualResult + 1;
                    $("#cim-search-results > span", self.root).html("Result " + result + " of " + searchResults.elements.length);
                    self.moveTo(searchResults.elements[searchResults.actualResult].attributes.getNamedItem("rdf:ID").value);
                }
            }
        });
        $("#showAllObjects").change(function () {
            self.createTree(this.checked);
        });
        $("#sshInput").change(function () {
            self.resetAttrs();
        });
        // setup tabs: reset path upon clicking on another tab
        $("a[data-toggle=\"tab\"]").on("click", function (e) {
            self.goToBasePath();
        });

        $("#output-editor-btn").on("click", function () {
            $("#vvveb-builder").toggleClass("bottom-panel-expand");
            $("#toggleOutputEditorJsExecute").toggle();
        });
    });

    self.parent.on("cleanUp", function () {
        self.diagramName = "";
    });

    // listen to 'showDiagram' event from parent
    self.parent.on("showDiagram", function (file, name, element) {
        if (decodeURI(name) !== self.diagramName) {
            d3.drag().on("drag.end", null);
            self.render(name);
        }
        if (typeof (element) !== "undefined") {
            self.moveTo(element);
        } else {
            // reset any element highlight
            d3.select(".tree").selectAll(".btn-danger").classed("btn-danger", false).classed("btn-primary", true);
        }
    });

    // listen to 'addToActiveDiagram' event from model
    self.model.on("addToActiveDiagram", function (object) {
        self.addNewObject(object);
    });

    self.goToBasePath = function () {
        let hashComponents = window.location.hash.substring(1).split("/");
        if (hashComponents.length > 3) {
            let basePath = hashComponents[0] + "/" + hashComponents[1] + "/" + hashComponents[2];
            route(basePath);
        }
    }

    self.addNewObject = function (object) {
        let cimNetwork = d3.select("div.tree > div.tab-content > div.tab-pane > ul#CIMComponents");
        let cimContainers = d3.select("div.tree > div.tab-content > div.tab-pane > ul#CIMContainers");
        let cimMeasurements = d3.select("div.tree > div.tab-content > div.tab-pane > ul#CIMMeasurements");
        let cimBases = d3.select("div.tree > div.tab-content > div.tab-pane > ul#CIMBases");
        let cimCurvesAndRegs = d3.select("div.tree > div.tab-content > div.tab-pane > ul#CIMCurvesAndRegs");
        let cimLimits = d3.select("div.tree > div.tab-content > div.tab-pane > ul#CIMLimits");
        let equivalents = undefined;
        let rotMac = undefined;
        let loads = undefined;
        let allComps = undefined;
        let genUnits = undefined;
        switch (object.nodeName) {
            case "cim:ACLineSegment":
                self.elements(cimNetwork, "ACLineSegment", "AC Line Segments", [object]);
                break;
            case "cim:Breaker":
                self.elements(cimNetwork, "Breaker", "Breakers", [object]);
                break;
            case "cim:Disconnector":
                self.elements(cimNetwork, "Disconnector", "Disconnectors", [object]);
                break;
            case "cim:LoadBreakSwitch":
                self.elements(cimNetwork, "LoadBreakSwitch", "Load Break Switches", [object]);
                break;
            case "cim:Junction":
                self.elements(cimNetwork, "Junction", "Junctions", [object]);
                break;
            case "cim:EnergySource":
                equivalents = self.createTopContainer(cimNetwork, "Equivalent", "Equivalents", [object]);
                self.elements(equivalents, "EnergySource", "Energy Sources", [object]);
                break;
            case "cim:SynchronousMachine":
                rotMac = self.createTopContainer(cimNetwork, "RotatingMachine", "RotatingMachines", [object]);
                self.elements(rotMac, "SynchronousMachine", "Synchronous Machines", [object]);
                break;
            case "cim:AsynchronousMachine":
                rotMac = self.createTopContainer(cimNetwork, "RotatingMachine", "RotatingMachines", [object]);
                self.elements(rotMac, "AsynchronousMachine", "Asynchronous Machines", [object]);
                break;
            case "cim:EnergyConsumer":
                loads = self.createTopContainer(cimNetwork, "Load", "Loads", [object]);
                self.elements(loads, "EnergyConsumer", "Energy Consumers", [object]);
                break;
            case "cim:ConformLoad":
                loads = self.createTopContainer(cimNetwork, "Load", "Loads", [object]);
                self.elements(loads, "ConformLoad", "Conform Loads", [object]);
                break;
            case "cim:NonConformLoad":
                loads = self.createTopContainer(cimNetwork, "Load", "Loads", [object]);
                self.elements(loads, "NonConformLoad", "Non Conform Loads", [object]);
                break;
            case "cim:LinearShuntCompensator":
                allComps = self.createTopContainer(cimNetwork, "Compensator", "Compensators", [object]);
                self.elements(allComps, "LinearShuntCompensator", "Linear", [object]);
                break;
            case "cim:NonlinearShuntCompensator":
                allComps = self.createTopContainer(cimNetwork, "Compensator", "Compensators", [object]);
                self.nlCompensators(allComps, [object]);
                break;
            case "cim:NonlinearShuntCompensatorPoint":
                let nlc = self.model.getTargets([object], "NonlinearShuntCompensatorPoint.NonlinearShuntCompensator");
                let nlcUUID = nlc[0].attributes.getNamedItem("rdf:ID").value;
                let nlcG = cimNetwork.selectAll("ul#" + nlcUUID);
                self.nlCompensatorPoints(nlcG, [object]);
                break;
            case "cim:PowerTransformer":
                self.powerTransformers(cimNetwork, [object]);
                break;
            case "cim:RatioTapChanger":
                let tcEnd = self.model.getTargets([object], "RatioTapChanger.TransformerEnd");
                let endUUID = tcEnd[0].attributes.getNamedItem("rdf:ID").value;
                let endG = cimNetwork.selectAll("ul#" + endUUID);
                self.tapChangers(endG, [object]);
                break;
            case "cim:BusbarSection":
                self.elements(cimNetwork, "BusbarSection", "Nodes", [object]);
                break;
            case "cim:BaseVoltage":
                let bvEnter = self.elements(cimBases, "BaseVoltage", "Base Voltages", [object]);
                self.createDeleteMenu(bvEnter);
                break;
            case "cim:GeographicalRegion":
                self.geoRegions(cimContainers, [object]);
                break;
            case "cim:SubGeographicalRegion":
                let region = self.model.getTargets([object], "SubGeographicalRegion.Region");
                let regionUUID = region[0].attributes.getNamedItem("rdf:ID").value;
                let regionG = cimContainers.selectAll("ul#" + regionUUID);
                self.subGeoRegions(regionG, [object]);
                break;
            case "cim:Substation":
                self.substations(cimContainers, [object]);
                break;
            case "cim:Location":
                self.locations(cimContainers, [object]);
                break;
            case "cim:PositionPoint":
                self.positionPoints(cimContainers, [object]);
                break;
            case "cim:CoordinateSystem":
                self.coordinateSystems(cimContainers, [object]);
                break;
            case "cim:VoltageLevel":
                let vlSub = self.model.getTargets([object], "VoltageLevel.Substation");
                let subUUID = vlSub[0].attributes.getNamedItem("rdf:ID").value;
                let subG = cimContainers.selectAll("ul#" + subUUID);
                self.voltageLevels(subG, [object]);
                break;
            case "cim:Bay":
                let bayVl = self.model.getTargets([object], "Bay.VoltageLevel");
                let vlUUID = bayVl[0].attributes.getNamedItem("rdf:ID").value;
                let vlG = cimContainers.selectAll("ul#" + vlUUID);
                self.bays(vlG, [object]);
                break;
            case "cim:Line":
                let lineEnter = self.elements(cimContainers, "Line", "Lines", [object]);
                self.createDeleteMenu(lineEnter);
                break;
            case "cim:GeneratingUnit":
                genUnits = self.createTopContainer(cimContainers, "GeneralGeneratingUnit", "Generating Units", [object]);
                self.elements(genUnits, "GeneratingUnit", "General Units", [object]);
                break;
            case "cim:ThermalGeneratingUnit":
                genUnits = self.createTopContainer(cimContainers, "GeneralGeneratingUnit", "Generating Units", [object]);
                self.elements(genUnits, "ThermalGeneratingUnit", "Thermal Units", [object]);
                break;
            case "cim:Analog":
                // let analogEnter = self.elements(cimMeasurements, "Analog", "Analogs", [object]);
                // self.createDeleteMenu(analogEnter);
                 //Added by SS
                 self.analogs(cimMeasurements, [object]);
                break;
            case "cim:Discrete":
                // let discEnter = self.elements(cimMeasurements, "Discrete", "Discretes", [object]);
                // self.createDeleteMenu(discEnter);
                //Added by SS
                self.discretes(cimMeasurements, [object]);
                break;
            case "cim:LoadResponseCharacteristic":
                let lrEnter = self.elements(cimCurvesAndRegs, "LoadResponseCharacteristic", "Load Response Characteristics", [object]);
                self.createDeleteMenu(lrEnter);
                break;
            case "cim:TapChangerControl":
                let tccEnter = self.elements(cimCurvesAndRegs, "TapChangerControl", "Tap Changer Controls", [object]);
                self.createDeleteMenu(tccEnter);
                break;
            case "cim:RegulatingControl":
                let rcEnter = self.elements(cimCurvesAndRegs, "RegulatingControl", "Regulating Controls", [object]);
                self.createDeleteMenu(rcEnter);
                break;
            case "cim:OperationalLimitType":
                let limTypesEnter = self.elements(cimLimits, "OperationalLimitType", "Operational Limit Types", [object]);
                self.createDeleteMenu(limTypesEnter);
            case "cim:OperationalLimitSet":
                self.limitSets(cimLimits, [object]);
                break;
            case "cim:VoltageLimit":
            case "cim:CurrentLimit":
            case "cim:ActivePowerLimit":
            case "cim:ApparentPowerLimit":
                let opSet = self.model.getTargets([object], "OperationalLimit.OperationalLimitSet");
                let setUUID = opSet[0].attributes.getNamedItem("rdf:ID").value;
                let setG = cimLimits.selectAll("ul#" + setUUID);
                self.limits(setG, [object]);
                break;
            default:
        }
    }

    // listen to 'deleteObject' event from model
    self.model.on("deleteObject", function (objectUUID) {
        self.deleteObject(objectUUID);
    });

    // listen to 'deleteFromDiagram' event from model
    self.model.on("deleteFromDiagram", function (objectUUID) {
        if ($("#showAllObjects").prop('checked') === false) {
            self.deleteObject(objectUUID);
        }
    });

    // listen to 'setAttribute' event from model
    self.model.on("setAttribute", function (object, attrName, value) {
        if (attrName === "cim:IdentifiedObject.name") {
            let type = object.localName;
            let target = d3.select("div.tree")
                .selectAll("ul#" + object.attributes.getNamedItem("rdf:ID").value);
            if (target.empty() === false) {
                let btn = d3.select(target.node().parentNode).select("button");
                btn.html(value);
            }
            $("[cim-target=\"" + object.attributes.getNamedItem("rdf:ID").value + "\"]").html(value);
        }
    });

    // listen to 'addLink' event from model
    self.model.on("addLink", function (source, linkName, target) {
        let sourceUUID = source.attributes.getNamedItem("rdf:ID").value;
        let sourceNode = d3.select(".tree").select("#" + sourceUUID);
        let removeBtn = sourceNode.selectAll("#cimRemoveBtn").filter(function (d) {
            return (d.attributes[0].value === "#" + linkName.split(":")[1]);
        });
        let linkBtn = sourceNode.selectAll(".cimLinkBtn").filter(function (d) {
            return (d.attributes[0].value === "#" + linkName.split(":")[1]);
        });

        linkBtn.html(function () {
            return self.model.getAttribute(target, "cim:IdentifiedObject.name").textContent;
        }).attr("cim-target", function () {
            return target.attributes.getNamedItem("rdf:ID").value;
        }).attr("disabled", null);
        sourceNode.selectAll("#cimTarget").attr("id", null);
        removeBtn.attr("disabled", null);
        // in bus-branch mode, we need to update base voltage
        // of topological node if the associated busbar is
        // updated.
        if (self.model.getMode() === "BUS_BRANCH") {
            if (source.nodeName === "cim:BusbarSection" && linkName === "cim:ConductingEquipment.BaseVoltage") {
                self.model.setLink(self.model.getNode(source), "cim:TopologicalNode.BaseVoltage", target);
            }
        }
    });

    // listen to 'removeLink' event from model
    self.model.on("removeLink", function (source, linkName, target) {
        let sourceUUID = source.attributes.getNamedItem("rdf:ID").value;
        let sourceNode = d3.select(".tree").select("#" + sourceUUID);
        let removeBtn = sourceNode.selectAll("#cimRemoveBtn").filter(function (d) {
            return (d.attributes[0].value === "#" + linkName.split(":")[1]);
        });
        let linkBtn = sourceNode.selectAll(".cimLinkBtn").filter(function (d) {
            return (d.attributes[0].value === "#" + linkName.split(":")[1]);
        });
        removeBtn.attr("disabled", "disabled");
        linkBtn.html("none")
            .attr("cim-target", "none")
            .attr("disabled", "disabled");
    });

    // listen to 'createdDiagram' event from model
    self.model.on("createdDiagram", function () {
        self.diagramName = decodeURI(self.model.activeDiagramName);
        $("#showAllObjects").prop("checked", true);
        $("#showAllObjects").change();
        $("#showAllObjects").parent().addClass("active");
    });

    // listen to 'setMode' event from model
    // this is used in order to hide operational stuff
    // when working in bus-branch mode.
    self.model.on("setMode", function (mode) {
        if (mode === "BUS_BRANCH") {
            $("#measurementsTab").hide();
        }
    });

    self.createTree = function (showAllObjects) {
        let treeRender = self.createTreeGenerator(showAllObjects);

        function periodic() {
            let ret = treeRender.next().value;
            if (typeof (ret) !== "undefined") {
                $("#loadingDiagramMsg").html("<br>" + ret);
                setTimeout(periodic, 1);
            } else {
                self.parent.trigger("loaded");
            }
        };
        periodic();
    }

    self.render = function (diagramName) {
        self.model.selectDiagram(decodeURI(diagramName));
        self.diagramName = decodeURI(diagramName);
        $("#showAllObjects").prop("checked", false);
        $("#showAllObjects").change();
        $("#showAllObjects").parent().removeClass("active");
    }

    self.createTreeGenerator = function* (showAllObjects) {
        // clear all
        d3.select("#app-tree").selectAll("#CIMComponents > li").remove();
        d3.select("#app-tree").selectAll("#CIMContainers > li").remove();
        d3.select("#app-tree").selectAll("#CIMMeasurements > li").remove();
        d3.select("#app-tree").selectAll("#CIMBases > li").remove();
        d3.select("#app-tree").selectAll("#CIMCurvesAndRegs > li").remove();
        d3.select("#app-tree").selectAll("#CIMLimits > li").remove();
        let cimNetwork = d3.select("div.tree > div.tab-content > div.tab-pane > ul#CIMComponents");
        let cimContainers = d3.select("div.tree > div.tab-content > div.tab-pane > ul#CIMContainers");
        let cimMeasurements = d3.select("div.tree > div.tab-content > div.tab-pane > ul#CIMMeasurements");
        let cimBases = d3.select("div.tree > div.tab-content > div.tab-pane > ul#CIMBases");
        let cimCurvesAndRegs = d3.select("div.tree > div.tab-content > div.tab-pane > ul#CIMCurvesAndRegs");
        let cimLimits = d3.select("div.tree > div.tab-content > div.tab-pane > ul#CIMLimits");
        let contNames = ["cim:Substation", "cim:Line"];
        let measNames = ["cim:Analog", "cim:Discrete"];
        let genNames = ["cim:GeneratingUnit", "cim:ThermalGeneratingUnit"];
        let allContainers = null;
        let allMeasurements = null;
        let allGeneratingUnits = null;
        let allSubGeoRegions = null;
        let allGeoRegions = null;
        let allLoadResponses = null;
        let allLimitSets = null;

        //Added by SS
        let allLocations = null;
        let allCoordinateSystems = null;
        let allPositionPoints = null;

        // setup the right function to get objects
        let getObjects = self.model.getObjects;
        let getConnectors = self.model.getObjects;
        if (showAllObjects === false) {
            getObjects = self.model.getGraphicObjects;
            getConnectors = self.model.getConnectors;
        }
        // in bus-branch mode, we artificially add busbar sections
        // (1-1 correspondence with topological nodes)
        if (self.model.getMode() === "BUS_BRANCH") {
            let objects = self.model.getObjects(["cim:BusbarSection", "cim:TopologicalNode"]);
            if (objects["cim:BusbarSection"].length === 0) {
                objects["cim:TopologicalNode"].forEach(function (topo) {
                    let newObj = self.model.createObject("cim:BusbarSection", {
                        node: topo
                    });
                    let name = self.model.getAttribute(topo, "cim:IdentifiedObject.name");
                    if (typeof (name) !== "undefined") {
                        self.model.setAttribute(newObj, "cim:IdentifiedObject.name", name.innerHTML);
                    }
                });
            }
        }

        // get all equipments
        let eqs = getObjects([
            "cim:BusbarSection",
            "cim:PowerTransformer",
            "cim:ACLineSegment",
            "cim:Breaker",
            "cim:Disconnector",
            "cim:LoadBreakSwitch",
            "cim:Junction",
            "cim:EnergySource",
            "cim:EquivalentInjection",
            "cim:SynchronousMachine",
            "cim:AsynchronousMachine",
            "cim:EnergyConsumer",
            "cim:ConformLoad",
            "cim:NonConformLoad",
            "cim:LinearShuntCompensator",
            "cim:NonlinearShuntCompensator"
        ]);
        yield "TREE: extracted equipments";
        // get additional objects
        allSubGeoRegions = getObjects(["cim:SubGeographicalRegion"])["cim:SubGeographicalRegion"];
        allGeoRegions = getObjects(["cim:GeographicalRegion"])["cim:GeographicalRegion"];

        //Added by SS
        allLocations = getObjects(["cim:Location"])["cim:Location"];
        allCoordinateSystems = getObjects(["cim:CoordinateSystem"])["cim:CoordinateSystem"];
        allPositionPoints = getObjects(["cim:PositionPoint"])["cim:PositionPoint"];

        if (showAllObjects === false) {
            allContainers = self.model.getLinkedObjects(
                contNames,
                ["EquipmentContainer.Equipments",
                    "Substation.VoltageLevels/EquipmentContainer.Equipments",
                    "Substation.VoltageLevels/VoltageLevel.Bays/EquipmentContainer.Equipments"
                ]);
            allMeasurements = self.model.getLinkedObjects(
                measNames,
                ["Measurement.PowerSystemResource"]);
            allGeneratingUnits = self.model.getLinkedObjects(
                genNames,
                ["GeneratingUnit.RotatingMachine"]);
            allSubGeoRegions = allSubGeoRegions.concat(
                self.model.getTargets(
                    allContainers["cim:Substation"],
                    "Substation.Region"));
            allGeoRegions = allGeoRegions.concat(
                self.model.getTargets(
                    allSubGeoRegions,
                    "SubGeographicalRegion.Region"));
            allSubGeoRegions = [...new Set(allSubGeoRegions)];
            allGeoRegions = [...new Set(allGeoRegions)];
            allLoadResponses = self.model.getLinkedObjects(
                ["cim:LoadResponseCharacteristic"],
                ["LoadResponseCharacteristic.EnergyConsumer"]);
            allLimitSets = self.model.getLinkedObjects(
                ["cim:OperationalLimitSet"],
                ["OperationalLimitSet.Equipment",
                    "OperationalLimitSet.Terminal/Terminal.ConductingEquipment"
                ]);

        } else {
            allContainers = getObjects(contNames);
            allMeasurements = getObjects(measNames);
            allGeneratingUnits = getObjects(genNames);
            allLoadResponses = getObjects(["cim:LoadResponseCharacteristic"]);
            allLimitSets = getObjects(["cim:OperationalLimitSet"]);
        }
        let noDiagObjs = self.model.getObjects(
            ["cim:BaseVoltage",
                "cim:TapChangerControl",
                "cim:RegulatingControl",
                "cim:OperationalLimitType"
            ])
        let allBusbarSections = getConnectors(["cim:BusbarSection"])["cim:BusbarSection"];
        let allInjections = eqs["cim:EnergySource"].concat(eqs["cim:EquivalentInjection"]);
        let allRotatingMachines = eqs["cim:SynchronousMachine"].concat(eqs["cim:AsynchronousMachine"]);
        let allEnergyConsumers = eqs["cim:EnergyConsumer"].concat(eqs["cim:ConformLoad"]).concat(eqs["cim:NonConformLoad"]);
        let allCompensators = eqs["cim:LinearShuntCompensator"].concat(eqs["cim:nonlinearShuntCompensator"]);
        // ====================================================================
        // ========================= "Measurements" ===========================
        // ====================================================================
        // let analogEnter = self.elements(cimMeasurements, "Analog", "Analogs", allMeasurements["cim:Analog"]);
        // self.createDeleteMenu(analogEnter);
        //Added by SS
        self.analogs(cimMeasurements, allMeasurements["cim:Analog"]);

        // let discEnter = self.elements(cimMeasurements, "Discrete", "Discretes", allMeasurements["cim:Discrete"]);
        // self.createDeleteMenu(discEnter);
        //Added by SS
        self.discretes(cimMeasurements, allMeasurements["cim:Discrete"]);
        // ====================================================================
        // ============================= "Bases" ==============================
        // ====================================================================
        let bvEnter = self.elements(cimBases, "BaseVoltage", "Base Voltages", noDiagObjs["cim:BaseVoltage"]);
        self.createDeleteMenu(bvEnter);
        // ====================================================================
        // =========================== "Components" ===========================
        // ====================================================================
        self.elements(cimNetwork, "ACLineSegment", "AC Line Segments", eqs["cim:ACLineSegment"]);
        self.elements(cimNetwork, "Breaker", "Breakers", eqs["cim:Breaker"]);
        self.elements(cimNetwork, "Disconnector", "Disconnectors", eqs["cim:Disconnector"]);
        self.elements(cimNetwork, "LoadBreakSwitch", "Load Break Switches", eqs["cim:LoadBreakSwitch"]);
        self.elements(cimNetwork, "Junction", "Junctions", eqs["cim:Junction"]);
        // Generic and external injections
        let allEquivalents = self.createTopContainer(cimNetwork, "Equivalent", "Equivalents", allInjections);
        self.elements(allEquivalents, "EnergySource", "Energy Sources", eqs["cim:EnergySource"]);
        self.elements(allEquivalents, "EquivalentInjection", "Equivalent Injections", eqs["cim:EquivalentInjection"]);
        // Rotating machines
        let allRotMac = self.createTopContainer(cimNetwork, "RotatingMachine", "Rotating Machines", allRotatingMachines);
        self.elements(allRotMac, "SynchronousMachine", "Synchronous Machines", eqs["cim:SynchronousMachine"]);
        self.elements(allRotMac, "AsynchronousMachine", "Asynchronous Machines", eqs["cim:AsynchronousMachine"]);
        // Loads
        let allLoads = self.createTopContainer(cimNetwork, "Load", "Loads", allEnergyConsumers);
        self.elements(allLoads, "EnergyConsumer", "Energy Consumers", eqs["cim:EnergyConsumer"]);
        self.elements(allLoads, "ConformLoad", "Conform Loads", eqs["cim:ConformLoad"]);
        self.elements(allLoads, "NonConformLoad", "Non Conform Loads", eqs["cim:NonConformLoad"]);
        // Compensators
        let allComps = self.createTopContainer(cimNetwork, "Compensator", "Compensators", allCompensators);
        self.elements(allComps, "LinearShuntCompensator", "Linear", eqs["cim:LinearShuntCompensator"]);
        self.nlCompensators(allComps, eqs["cim:NonlinearShuntCompensator"]);
        // Busbars
        self.elements(cimNetwork, "BusbarSection", "Nodes", allBusbarSections);
        // Transformers
        self.powerTransformers(cimNetwork, eqs["cim:PowerTransformer"]);
        // ====================================================================
        // =========================== "Containers" ===========================
        // ====================================================================
        self.locations(cimContainers, allLocations);
        self.positionPoints(cimContainers, allPositionPoints);
        self.coordinateSystems(cimContainers, allCoordinateSystems);

        self.geoRegions(cimContainers, allGeoRegions);
        self.substations(cimContainers, allContainers["cim:Substation"]);
        let lineEnter = self.elements(cimContainers, "Line", "Lines", allContainers["cim:Line"]);
        self.createDeleteMenu(lineEnter);
        let allGenUnits = self.createTopContainer(cimContainers, "GeneralGeneratingUnit", "Generating Units", allGeneratingUnits["cim:GeneratingUnit"].concat(allGeneratingUnits["cim:ThermalGeneratingUnit"]));
        self.elements(allGenUnits, "GeneratingUnit", "General Units", allGeneratingUnits["cim:GeneratingUnit"]);
        self.elements(allGenUnits, "ThermalGeneratingUnit", "Thermal Units", allGeneratingUnits["cim:ThermalGeneratingUnit"]);
        // ====================================================================
        // ===================== "Curves and Regulations" =====================
        // ====================================================================
        self.elements(cimCurvesAndRegs, "LoadResponseCharacteristic", "Load Response Characteristics", allLoadResponses["cim:LoadResponseCharacteristic"]);
        let tccEnter = self.elements(cimCurvesAndRegs, "TapChangerControl", "Tap Changer Controls", noDiagObjs["cim:TapChangerControl"]);
        self.createDeleteMenu(tccEnter);
        let rcEnter = self.elements(cimCurvesAndRegs, "RegulatingControl", "Regulating Controls", noDiagObjs["cim:RegulatingControl"]);
        self.createDeleteMenu(rcEnter);
        // ====================================================================
        // ======================= "Operational Limits" =======================
        // ====================================================================
        let limTypesEnter = self.elements(cimLimits, "OperationalLimitType", "Operational Limit Types", noDiagObjs["cim:OperationalLimitType"]);
        self.createDeleteMenu(limTypesEnter);
        self.limitSets(cimLimits, allLimitSets["cim:OperationalLimitSet"]);

        // add buttons
        self.createAddButton(cimBases, "BaseVoltage");
        self.createAddButton(cimContainers, "PositionPoint");
        self.createAddButton(cimContainers, "CoordinateSystem");
        self.createAddButton(cimContainers, "Location");
        self.createAddButton(cimContainers, "Substation");
        self.createAddButton(cimContainers, "GeographicalRegion");
        self.createAddButton(cimContainers, "Line");
        self.createAddButton(cimContainers, "GeneratingUnit");
        self.createAddButton(cimContainers, "ThermalGeneratingUnit");
        self.createAddButton(cimCurvesAndRegs, "LoadResponseCharacteristic");
        self.createAddButton(cimLimits, "OperationalLimitType");
    }

    //Added by SS
    self.locations = function (tab, allLocations) {
        let locEnter = self.elements(tab, "Location", "Locations", allLocations);
        // geoEnter.each(function (d, i) {
        //     let subGeos = self.model.getTargets(
        //         [d],
        //         "GeographicalRegion.Regions");
        // self.subGeoRegions(
        //     d3.select(this),
        //     subGeos);
        // self.subAddButton(
        //     d3.select(this),
        //     "SubGeographicalRegion",
        //     "cim:SubGeographicalRegion.Region");
        // });
        self.createDeleteMenu(locEnter);
    }
    self.positionPoints = function (tab, allPositionPoints) {
        let locEnter = self.elements(tab, "PositionPoint", "Position Points", allPositionPoints);
        self.createDeleteMenu(locEnter);
    }
    self.coordinateSystems = function (tab, allCoordinateSystems) {
        let locEnter = self.elements(tab, "CoordinateSystem", "Coordinate Systems", allCoordinateSystems);
        self.createDeleteMenu(locEnter);
    }

    self.discretes = function (tab, allDiscretes) {
        let discEnter = self.elements(tab, "Discrete", "Discretes", allDiscretes);
        discEnter.each(function (d, i) {
            let subDiscVals = self.model.getTargets(
                [d],
                "Discrete.DiscreteValues");

            if (subDiscVals.length == 0) {
                let newObject = self.model.createObject("cim:DiscreteValue");
                self.model.setLink(newObject, "cim:DiscreteValue.Discrete", discEnter.data()[0]);
                self.model.addToActiveDiagram(newObject, []);
                self.discreteValues(tab, [newObject], function (parent) {
                    // self.model.setLink(newObject,"cim:Discrete.DiscreteValues", parent);
                    // self.model.addToActiveDiagram(newObject, []);
                });

            } else {
                self.discreteValues(
                    tab,
                    subDiscVals);
            }
        });

        self.createDeleteMenu(discEnter);
    }

    self.discreteValues = function (tab, allDiscreteValues, cb) {
        let discValEnter = self.elements(tab, "DiscreteValue", "Discrete Values", allDiscreteValues);

        // if (cb != undefined) {
        //     cb(discValEnter.data()[0]);
        // }

        discValEnter.each(function (d, i) {
            let subRemSrc = self.model.getTargets(
                [d],
                "MeasurementValue.RemoteSource");

            if (subRemSrc.length == 0) {
                let newObject = self.model.createObject("cim:RemoteSource");
                self.model.setLink(newObject, "cim:RemoteSource.MeasurementValue", discValEnter.data()[0]);
                self.model.addToActiveDiagram(newObject, []);
                self.remoteSources(tab, [newObject], function (parent) {
                    // self.model.setLink(newObject,"cim:Discrete.DiscreteValues", parent);
                    // self.model.addToActiveDiagram(newObject, []);
                });

            } else {
                self.remoteSources(
                    tab,
                    subRemSrc);
            }
        });
    }

    self.analogs = function (tab, allAnalogs) {
        let analogEnter = self.elements(tab, "Analog", "Analogs", allAnalogs);

        analogEnter.each(function (d, i) {
            let subAnlgVals = self.model.getTargets(
                [d],
                "Analog.AnalogValues");

            if (subAnlgVals.length == 0) {
                let newObject = self.model.createObject("cim:AnalogValue");
                self.model.setLink(newObject, "cim:AnalogValue.Analog", analogEnter.data()[0]);
                self.model.addToActiveDiagram(newObject, []);
                self.analogValues(tab, [newObject], function (parent) {
                });

            } else {
                self.analogValues(
                    tab,
                    subAnlgVals);
            }
        });

        self.createDeleteMenu(analogEnter);
    }

    self.analogValues = function (tab, allAnalogValues, cb) {
        let anlgValEnter = self.elements(tab, "AnalogValue", "Analog Values", allAnalogValues);

        // if (cb != undefined) {
        //     cb(anlgValEnter.data()[0]);
        // }

        anlgValEnter.each(function (d, i) {
            let subRemSrc = self.model.getTargets(
                [d],
                "MeasurementValue.RemoteSource");

            if (subRemSrc.length == 0) {
                let newObject = self.model.createObject("cim:RemoteSource");
                self.model.setLink(newObject, "cim:RemoteSource.MeasurementValue", anlgValEnter.data()[0]);
                self.model.addToActiveDiagram(newObject, []);
                self.remoteSources(tab, [newObject], function (parent) {
                });

            } else {
                self.remoteSources(
                    tab,
                    subRemSrc);
            }
        });
    }

    self.remoteSources = function (tab, allRemoteSources, cb) {
        let remoteSrcEnter = self.elements(tab, "RemoteSource", "Remote Source", allRemoteSources);

    }

    self.geoRegions = function (tab, allGeoRegions) {
        let geoEnter = self.elements(tab, "GeographicalRegion", "Geographical Regions", allGeoRegions);
        geoEnter.each(function (d, i) {
            let subGeos = self.model.getTargets(
                [d],
                "GeographicalRegion.Regions");
            self.subGeoRegions(
                d3.select(this),
                subGeos);
            self.subAddButton(
                d3.select(this),
                "SubGeographicalRegion",
                "cim:SubGeographicalRegion.Region");
        });
        self.createDeleteMenu(geoEnter);
    }

    self.subGeoRegions = function (geoG, subGeos) {
        let geo = geoG.data()[0];
        let subGeoEnter = self.elements(
            geoG,
            geo.attributes.getNamedItem("rdf:ID").value + "SubGeographicalRegion",
            "Sub-Geographical Regions",
            subGeos);
        self.createDeleteMenu(subGeoEnter);
    }

    self.substations = function (tab, allSubstations) {
        let subEnter = self.elements(tab, "Substation", "Substations", allSubstations);
        subEnter.each(function (d, i) {
            let vlevs = self.model.getTargets(
                [d],
                "Substation.VoltageLevels");
            self.voltageLevels(
                d3.select(this),
                vlevs);
            self.subAddButton(
                d3.select(this),
                "VoltageLevel",
                "cim:VoltageLevel.Substation");
        });
        self.createDeleteMenu(subEnter);
    }

    self.voltageLevels = function (subG, vlevs) {
        let sub = subG.data()[0];
        let vlEnter = self.elements(
            subG,
            sub.attributes.getNamedItem("rdf:ID").value + "VoltageLevel",
            "Voltage Levels",
            vlevs);
        vlEnter.each(function (d, i) {
            let bays = self.model.getTargets(
                [d],
                "VoltageLevel.Bays");
            self.bays(
                d3.select(this),
                bays);
            self.subAddButton(
                d3.select(this),
                "Bay",
                "cim:Bay.VoltageLevel");
        });
        self.createDeleteMenu(vlEnter);
    }

    self.bays = function (vlG, bays) {
        let vl = vlG.data()[0];
        let bayEnter = self.elements(
            vlG,
            vl.attributes.getNamedItem("rdf:ID").value + "Bay",
            "Bays",
            bays);
        self.createDeleteMenu(bayEnter);
    }

    self.powerTransformers = function (tab, allTrafos) {
        let trafoEnter = self.elements(tab, "PowerTransformer", "Transformers", allTrafos);
        trafoEnter.each(function (d, i) {
            // trafo ends
            let trafoEnds = self.model.getTargets(
                [d],
                "PowerTransformer.PowerTransformerEnd");
            let trafoEndsEnter = self.elements(
                d3.select(this),
                d.attributes.getNamedItem("rdf:ID").value + "PowerTransformerEnd",
                "Transformer Windings",
                trafoEnds);
            $(trafoEndsEnter.nodes()).parent().addClass("CIM-subobject");
            // tap changer(s)
            trafoEndsEnter.each(function (d, i) {
                let tcs = self.model.getTargets([d], "TransformerEnd.RatioTapChanger");
                self.tapChangers(d3.select(this), tcs);
            });
        });
    }

    self.nlCompensators = function (tab, allNLCs) {
        let nlcEnter = self.elements(tab, "NonlinearShuntCompensator", "Nonlinear", allNLCs);
        nlcEnter.each(function (d, i) {
            // nlc points
            let nlcPoints = self.model.getTargets(
                [d],
                "NonlinearShuntCompensator.NonlinearShuntCompensatorPoints");
            self.nlCompensatorPoints(d3.select(this), nlcPoints);
            self.subAddButton(
                d3.select(this),
                "NonlinearShuntCompensatorPoint",
                "cim:NonlinearShuntCompensatorPoint.NonlinearShuntCompensator");
        });
    }

    self.nlCompensatorPoints = function (nlcG, nlcPoints) {
        let nlc = nlcG.data()[0];
        let nlcPointsEnter = self.elements(
            nlcG,
            nlc.attributes.getNamedItem("rdf:ID").value + "NonlinearShuntCompensatorPoint",
            "Points",
            nlcPoints, true);
        $(nlcPointsEnter.nodes()).parent().addClass("CIM-subobject");
        self.createDeleteMenu(nlcPointsEnter);
    }

    self.tapChangers = function (trafoG, tcs) {
        let trafo = trafoG.data()[0];
        let tcEnter = self.elements(
            trafoG,
            trafo.attributes.getNamedItem("rdf:ID").value + "RatioTapChanger",
            "Ratio Tap Changer",
            tcs);
        $(tcEnter.nodes()).parent().addClass("CIM-subobject");
        self.createDeleteMenu(tcEnter);
    }

    self.limitSets = function (tab, allLimits) {
        let limSetEnter = self.elements(tab, "OperationalLimitSet", "Operational Limit Sets", allLimits);
        limSetEnter.each(function (d, i) {
            // limits
            let lims = self.model.getTargets(
                [d],
                "OperationalLimitSet.OperationalLimitValue");
            self.limits(d3.select(this), lims);
            self.subAddButton(
                d3.select(this),
                "VoltageLimit",
                "cim:OperationalLimit.OperationalLimitSet");
            self.subAddButton(
                d3.select(this),
                "CurrentLimit",
                "cim:OperationalLimit.OperationalLimitSet");
            self.subAddButton(
                d3.select(this),
                "ActivePowerLimit",
                "cim:OperationalLimit.OperationalLimitSet");
            self.subAddButton(
                d3.select(this),
                "ApparentPowerLimit",
                "cim:OperationalLimit.OperationalLimitSet");
        });
        self.createDeleteMenu(limSetEnter);
    }

    self.limits = function (setG, lims) {
        let opset = setG.data()[0];
        let vLims = lims.filter(el => self.model.schema.isA("VoltageLimit", el));
        let iLims = lims.filter(el => self.model.schema.isA("CurrentLimit", el));
        let pLims = lims.filter(el => self.model.schema.isA("ActivePowerLimit", el));
        let sLims = lims.filter(el => self.model.schema.isA("ApparentPowerLimit", el));
        let vLimEnter = self.elements(
            setG,
            opset.attributes.getNamedItem("rdf:ID").value + "VoltageLimit",
            "Voltage limits",
            vLims);
        let iLimEnter = self.elements(
            setG,
            opset.attributes.getNamedItem("rdf:ID").value + "CurrentLimit",
            "Current limits",
            iLims);
        let pLimEnter = self.elements(
            setG,
            opset.attributes.getNamedItem("rdf:ID").value + "ActivePowerLimit",
            "Active power limits",
            pLims);
        let sLimEnter = self.elements(
            setG,
            opset.attributes.getNamedItem("rdf:ID").value + "ApparentPowerLimit",
            "Apparent power limits",
            sLims);
        self.createDeleteMenu(vLimEnter);
        self.createDeleteMenu(iLimEnter);
        self.createDeleteMenu(pLimEnter);
        self.createDeleteMenu(sLimEnter);
    }

    self.createTopContainer = function (cimNetwork, name, printName, data) {
        let elementsTopContainer = cimNetwork.select("li." + name + "s");
        let elements = elementsTopContainer.select("ul#" + name + "sList");
        if (elementsTopContainer.empty()) {
            elementsTopContainer = cimNetwork
                .append("li")
                .attr("class", name + "s" + " list-group-item d-flex justify-content-between cim-parent-container");
            let listContainer = elementsTopContainer.append("div");
            listContainer.append("a")
                //.attr("class", "btn btn-primary btn-sm")
                .attr("class", "btn btn-primary btn-xs")
                .attr("role", "button")
                .attr("data-toggle", "collapse")
                .attr("href", "#" + name + "sList")
                .html(printName);
            //elementsTopContainer.append("h4")
            elementsTopContainer.append("h5")
                .append("span")
                .attr("class", "badge badge-primary badge-pill")
                .html(0);
            elements = listContainer
                .append("ul")
                .attr("id", name + "sList")
                .attr("class", "collapse");
            elementsTopContainer.on("click", function () {
                if (d3.event.target === this) {
                    self.goToBasePath();
                }
            });
        }
        return elements;
    }

    // add button for non-graphical objects
    self.createAddButton = function (cimContainer, name) {
        let elementsTopContainer = cimContainer.select("li." + name + "s");
        let elements = elementsTopContainer.select("ul#" + name + "sList");
        let addBtn = elementsTopContainer.select("ul#" + name + "sList > button.cim-add-btn");
        if (addBtn.empty() === true) {
            addBtn = elements
                .insert("li", ":first-child")
                .append("button")
                .attr("class", "btn btn-default btn-xs cim-add-btn")
                //.attr("class", "btn btn-default btn-sm cim-add-btn")
                .attr("type", "submit");
            addBtn.html("<span class=\"fas fa-plus\" aria-hidden=\"true\"></span> Add");
            addBtn.on("click.add", function () {
                let newObject = self.model.createObject("cim:" + name);
                self.model.addToActiveDiagram(newObject, []);
            });
        }
    }

    self.subAddButton = function (cimContainer, type, link) {
        let parent = cimContainer.data()[0];
        let name = parent.attributes.getNamedItem("rdf:ID").value + type;
        let elementsTopContainer = cimContainer.select("li." + name + "s");
        let elements = elementsTopContainer.select("ul#" + name + "sList");
        let addBtn = elementsTopContainer.select("ul#" + name + "sList > button.cim-add-btn");
        if (addBtn.empty() === true) {
            addBtn = elements
                .insert("li", ":first-child")
                .append("button")
                .attr("class", "btn btn-default btn-xs cim-add-btn")
                //.attr("class", "btn btn-default btn-sm cim-add-btn")
                .attr("type", "submit");
            addBtn.html("<span class=\"fas fa-plus\" aria-hidden=\"true\"></span> Add");
            addBtn.on("click.add", function () {
                let newObject = self.model.createObject("cim:" + type);
                self.model.setLink(newObject, link, parent);
                self.model.addToActiveDiagram(newObject, []);
            });
        }
    }

    // delete menu for non graphic objects
    self.createDeleteMenu = function (selection) {
        let btnSel = selection.selectAll(function () {
            return this.parentNode.childNodes;
        }).filter("button.cim-object-btn");
        btnSel.on("contextmenu", menu);
    }

    self.elements = function (cimNetwork, name, printName, data, isSubobject) {
        let elementsTopContainer = cimNetwork.select("li." + name + "s");
        let elements = elementsTopContainer.select("ul#" + name + "sList");
        if (elementsTopContainer.empty() === true) {
            elementsTopContainer = cimNetwork
                .append("li")
                .attr("class", name + "s" + " list-group-item d-flex justify-content-between");
            let listContainer = elementsTopContainer.append("div");
            listContainer.append("a")
                //.attr("class", "btn btn-primary btn-sm")
                .attr("class", "btn btn-primary btn-xs")
                .attr("role", "button")
                .attr("data-toggle", "collapse")
                .attr("href", "#" + name + "sList")
                .html(printName);
            //elementsTopContainer.append("h4")
            elementsTopContainer.append("h5")
                .append("span")
                .attr("class", "badge badge-primary badge-pill")
                .html(0);
            elementsTopContainer.on("click", function () {
                if (d3.event.target === this) {
                    self.goToBasePath();
                }
            });
            elements = elementsTopContainer
                .select("div")
                .append("ul")
                .attr("id", name + "sList")
                .attr("class", "collapse");
        }

        let elementTopContainer = elements
            .selectAll("li." + name)
            .data(data, function (d) {
                return d.attributes.getNamedItem("rdf:ID").value;
            })
            .enter()
            .append("li")
            .attr("class", name + " CIM-object").on("click", function () {
                if (d3.event.target === this) {
                    self.goToBasePath();
                }
            });
        let cimModel = this.model;
        // Add two buttons: one for expanding attributes and links,
        // the other for navigation
        elementTopContainer
            .append("a")
            //.attr("class", "btn btn-outline-secondary btn-sm cim-expand-object")
            .attr("class", "btn btn-outline-secondary btn-xs cim-expand-object")
            .attr("role", "button")
            .attr("data-toggle", "collapse")
            .attr("href", function (d) {
                return "#" + d.attributes.getNamedItem("rdf:ID").value;
            }).on("click", function (d) {
                // if necessary, generate attributes and links
                let elementEnter = d3.select(this.parentNode).select("ul");
                if (elementEnter.selectAll("li.attribute").size() === 0) {
                    self.generateAttrsAndLinks(elementEnter);
                }
            })
            .html("<span class=\"fas fa-plus\" aria-hidden=\"true\"></span>");
        elementTopContainer
            .append("button")
            //.attr("class", "btn btn-primary btn-sm cim-object-btn")
            .attr("class", "btn btn-primary btn-xs cim-object-btn")
            .on("click", function (d) {
                // change address to 'this object'
                let hashComponents = window.location.hash.substring(1).split("/");
                let basePath = hashComponents[0] + "/" + hashComponents[1] + "/" + hashComponents[2];
                if (window.location.hash.substring(1) !== basePath + "/" + d.attributes.getNamedItem("rdf:ID").value) {
                    route(basePath + "/" + d.attributes.getNamedItem("rdf:ID").value);
                }
            })
            .html(function (d) {
                let name = cimModel.getAttribute(d, "cim:IdentifiedObject.name");
                if (typeof (name) !== "undefined") {
                    return name.innerHTML;
                }
                return "unnamed";
            })
            .attr("draggable", "true")
            .on("dragstart", function (d) {
                d3.event.dataTransfer.setData('text/plain', d.attributes.getNamedItem("rdf:ID").value);
            });

        let elementEnter = elementTopContainer
            .append("ul")
            .attr("id", function (d) {
                return d.attributes.getNamedItem("rdf:ID").value;
            })
            .attr("class", "collapse CIM-object-list")
            .attr("style", "padding-left:28px !important"); //Added by SS
        // update element count
        //let elementCount = parseInt(elementsTopContainer.select(":scope > h4 > span").html());
        let elementCount = parseInt(elementsTopContainer.select(":scope > h5 > span").html());
        elementCount = elementCount + elementEnter.size();
        //elementsTopContainer.select(":scope > h4 > span").html(elementCount);
        elementsTopContainer.select(":scope > h5 > span").html(elementCount);
        // update also the top containers (if any)
        if (typeof (isSubobject) === "undefined" || isSubobject === false) {
            let tcNode = elementsTopContainer.node();
            $(tcNode).parents("li.cim-parent-container")
                //.find(">h4>span")
                .find(">h5>span")
                .each(function () {
                    let elementCount = parseInt($(this).html());
                    elementCount = elementCount + elementEnter.size();
                    $(this).html(elementCount);
                });
        }
        return elementEnter;
    }

    self.generateAttrsAndLinks = function (elementEnter) {
        // add attributes
        let elementDiv = createTopDivs($("#sshInput").prop('checked') === false, "EQ");
        self.generateAttributes(elementDiv);

        elementDiv = createTopDivs($("#sshInput").prop('checked') === false, "GL");
        self.generateAttributes(elementDiv);

        let sshDiv = createTopDivs($("#sshInput").prop('checked') === true, "SSH");
        self.generateAttributes(sshDiv);
        // add links
        let eqLinks = createLinkDivs($("#sshInput").prop('checked') === false, "EQ");
        self.generateLinks(eqLinks);

        eqLinks = createLinkDivs($("#sshInput").prop('checked') === false, "GL");
        self.generateLinks(eqLinks);

        let sshLinks = createLinkDivs($("#sshInput").prop('checked') === true, "SSH");
        self.generateLinks(sshLinks);

        function createTopDivs(visible, profile) {
            let elementDiv = elementEnter
                .selectAll("li.attribute." + profile)
                .data(function (d) {
                    let attrs = self.model.schema.getSchemaAttributes(d.localName, profile);
                    let existing = elementEnter.selectAll("li.attribute > div > span.cim-tree-attribute-name").nodes().map(node => node.textContent);
                    attrs = attrs.filter(function (attr) {
                        let attrName = attr.attributes[0].value.substring(1).split(".")[1];
                        return existing.indexOf(attrName) < 0;
                    });
                    return attrs.filter(el => el.attributes[0].value !== "#IdentifiedObject.mRID");
                })
                .enter()
                .append("li")
                .attr("class", getClasses(visible, profile))
                .attr("title", function (d) {
                    let about = d.attributes.getNamedItem("rdf:about").value;
                    let fullName = about.split(".")[1];
                    let comment = [].filter.call(d.children, function (el) {
                        return el.nodeName === "rdfs:comment"
                    });
                    if (comment.length > 0) {
                        return fullName + " - " + comment[0].textContent;
                    }
                    return fullName;
                })
                //.append("div").attr("class", "input-group");
                .append("div").attr("class", "input-group input-group-xs");
            return elementDiv;
        };

        function createLinkDivs(visible, profile) {
            let elementLink = elementEnter
                .selectAll("li.link." + profile)
                .data(function (d) {
                    // links we don't want to show in the tree
                    let hiddenLinks = [ //main rdf file schema
                        "#NonlinearShuntCompensatorPoint.NonlinearShuntCompensator",
                        "#TransformerEnd.Terminal",
                        "#PowerTransformerEnd.PowerTransformer",
                        "#RatioTapChanger.TransformerEnd",
                        "#RegulatingControl.Terminal",
                        "#Measurement.Terminal",
                        "#Measurement.PowerSystemResource",
                        "#Discrete.ValueAliasSet",
                        "#OperationalLimitSet.Terminal",
                        "#OperationalLimitSet.Equipment",
                        "#OperationalLimit.OperationalLimitSet",
                        "#SubGeographicalRegion.Region",
                        "#VoltageLevel.Substation",
                        "#Bay.VoltageLevel",
                        //Added by SS
                        "#Location.PositionPoints",
                        //"#PositionPoint.Location",
                        "#CoordinateSystem.Location",
                        "#Location.PowerSystemResources"
                        //"#PowerSystemResource.Location"

                    ];

                    //  let hiddenLinks = [
                    //     "#NonlinearShuntCompensatorPoint.NonlinearShuntCompensator",
                    //     "#TransformerEnd.Terminal",
                    //     "#PowerTransformerEnd.PowerTransformer",
                    //     "#RatioTapChanger.TransformerEnd",
                    //     "#RegulatingControl.Terminal",
                    //     "#Measurement.Terminal",
                    //     "#Measurement.PowerSystemResource",
                    //     "#Discrete.ValueAliasSet",
                    //     "#OperationalLimitSet.Terminal",
                    //     "#OperationalLimitSet.Equipment",
                    //     "#OperationalLimit.OperationalLimitSet",
                    //     "#SubGeographicalRegion.Region",
                    //     "#VoltageLevel.Substation",
                    //     "#Bay.VoltageLevel",
                    //     //Added by SS
                    //     "#Location.PositionPoints",
                    //     //"#PositionPoint.Location",
                    //     "#CoordinateSystem.PositionPoint",
                    //     "#Location.PowerSystemResources"
                    //     //"#PowerSystemResource.Location"

                    // ];

                    if (profile == "GL") {
                        return self.model.schema.getSchemaLinks(d.localName, profile)
                            .filter(el => hiddenLinks.indexOf(el.attributes[0].value) < 0);
                    }
                    return self.model.schema.getSchemaLinks(d.localName, profile)
                        .filter(el => self.model.getAttribute(el, "cims:AssociationUsed").textContent === "Yes")
                        .filter(el => hiddenLinks.indexOf(el.attributes[0].value) < 0)
                })
                .enter()
                .append("li")
                .attr("class", getClasses(visible, profile))
                .attr("title", function (d) {
                    let about = d.attributes.getNamedItem("rdf:about").value;
                    let fullName = about.split(".")[1];
                    let comment = [].filter.call(d.children, function (el) {
                        return el.nodeName === "rdfs:comment"
                    });
                    if (comment.length > 0) {
                        return fullName + " - " + comment[0].textContent;
                    }
                    return fullName;
                })
                //.append("div").attr("class", "input-group");
                .append("div").attr("class", "input-group input-group-xs");
            return elementLink;
        };

        function getClasses(visible, profile) {
            return function (d) {
                // Every attribute has class "attribute" and either "EQ"
                // or "SSH" depending on its profile.
                let ret = "attribute " + profile;
                // ENTSO-E attributes have class "entsoe".
                let about = d.attributes.getNamedItem("rdf:about").value;
                if (about.startsWith("#") === false) {
                    ret = ret + " entsoe";
                }
                // If profile is "EQ" we add also the stereotype, in order to
                // distinguish between core, operation, short circuit.
                let stereotype = null;
                if (profile === "EQ") {
                    stereotype = self.model.schema.getSchemaStereotype(d);
                    if (stereotype !== null) {
                        ret = ret + " " + stereotype;
                    }
                }
                // In some cases we don't want to show the attribute.
                if ((stereotype === "Operation" && self.model.getMode() === "BUS_BRANCH") ||
                    (visible === false)) {
                    ret = ret + " d-none";
                }
                return ret;
            };
        };
    }

    self.generateAttributes = function (elementDiv) {
        elementDiv.append("div").attr("class", "input-group-prepend").append("span").attr("class", "input-group-text cim-tree-attribute-name")
            .html(function (d) {
                let about = d.attributes.getNamedItem("rdf:about").value;
                let fullName = about.split(".")[1];
                if (fullName.length > 20) {
                    fullName = fullName.substring(0, 20) + "...";
                }
                return fullName;
            });
        // String attributes 
        elementDiv.filter(function (d) {
                let attrType = self.model.schema.getSchemaAttributeType(d);
                return attrType[0] === "#String";
            }).append("input")
            .attr("class", "form-control")
            .each(setValueFromModel)
            .attr("type", "text")
            .on("input", attrInput);
        // Integer attributes
        elementDiv.filter(function (d) {
                let attrType = self.model.schema.getSchemaAttributeType(d);
                return attrType[0] === "#Integer";
            }).append("input")
            .attr("class", "form-control")
            .each(setIntValueFromModel)
            .attr("type", "number")
            .on("input", attrInput);
        // Float attributes
        let floats = elementDiv.filter(function (d) {
            let attrType = self.model.schema.getSchemaAttributeType(d);
            return (attrType[0] === "#Float" || attrType[0] === "#Decimal");
        });
        floats.append("input")
            .attr("class", "form-control")
            .each(setFloatValueFromModel)
            .attr("type", "number")
            .attr("step", "0.00001")
            .on("input", attrInput);
        floats.append("div").attr("class", "input-group-append").append("span").attr("class", "input-group-text cim-tree-attribute-uom")
            .html(function (d) {
                let attrType = self.model.schema.getSchemaAttributeType(d);
                if (attrType[2] === "none") {
                    return attrType[1];
                }
                return attrType[2] + attrType[1];
            });
        // Boolean attributes
        let elementBool = elementDiv.filter(function (d) {
            let attrType = self.model.schema.getSchemaAttributeType(d);
            return attrType[0] === "#Boolean";
        }).append("div").attr("class", "input-group-append cim-tree-btn-group");
        let elementBoolBtn = elementBool.append("button").attr("type", "button")
            .attr("class", "btn btn-outline-secondary dropdown-toggle cim-tree-dropdown-toggle")
            .attr("data-toggle", "dropdown")
            .attr("aria-haspopup", "true")
            .attr("aria-expanded", "false");
        elementBoolBtn.append("span").attr("class", "boolVal").each(setBoolValueFromModel);
        elementBoolBtn.append("span").attr("class", "caret");
        let elementBoolList = elementBool.append("div").attr("class", "dropdown-menu");
        elementBoolList.append("a").attr("class", "dropdown-item").text("true").on("click", setBoolAttr);
        elementBoolList.append("a").attr("class", "dropdown-item").text("false").on("click", setBoolAttr);
        // DateTime attributes (note: such input types are not supported by Firefox) 
        elementDiv.filter(function (d) {
                let attrType = self.model.schema.getSchemaAttributeType(d);
                return attrType[0] === "#DateTime";
            }).append("input")
            .attr("class", "form-control")
            .each(setValueFromModel)
            .attr("type", "datetime-local")
            .on("input", attrInput);
        // Enum attributes
        let elementEnum = elementDiv.filter(function (d) {
            return self.model.schema.isEnum(d);
        }).append("div").attr("class", "input-group-append cim-tree-btn-group");
        let elementEnumBtn = elementEnum.append("button").attr("type", "button")
            .attr("class", "btn btn-outline-secondary dropdown-toggle cim-tree-dropdown-toggle")
            .attr("data-toggle", "dropdown")
            .attr("aria-haspopup", "true")
            .attr("aria-expanded", "false");
        elementEnumBtn.append("span").attr("class", "enumVal").each(setEnumValueFromModel);
        elementEnumBtn.append("span").attr("class", "caret");
        let elementEnumList = elementEnum.append("div")
            .attr("class", "dropdown-menu")
            .attr("style", "height: 200px;overflow-y: scroll;"); //Added by SS
        elementEnumList
            .selectAll("a")
            .data(function (d) {
                return self.model.schema.getSchemaEnumValues(d);
            })
            .enter()
            .append("a")
            .on("click", setEnumAttr)
            .attr("class", "dropdown-item")
            .text(function (d) {
                return d;
            });

        function setValueFromModel(d) {
            let object = d3.select($(this).parents("li.attribute").first().parent().get(0)).data()[0];
            let value = self.model.getAttribute(object, "cim:" + d.attributes[0].value.substring(1));
            if (typeof (value) !== "undefined") {
                this.value = value.innerHTML;
            } else {
                d3.select(this).attr("placeholder", "none");
            }
        };

        function setIntValueFromModel(d) {
            let object = d3.select($(this).parents("ul").first().get(0)).data()[0];
            let value = self.model.getAttribute(object, "cim:" + d.attributes[0].value.substring(1));
            if (typeof (value) !== "undefined") {
                this.value = parseInt(value.innerHTML);
            } else {
                d3.select(this).attr("placeholder", "none");
            }
        };

        function setFloatValueFromModel(d) {
            let object = d3.select($(this).parents("ul").first().get(0)).data()[0];
            let value = self.model.getAttribute(object, "cim:" + d.attributes[0].value.substring(1));
            if (typeof (value) !== "undefined") {
                this.value = parseFloat(value.innerHTML).toFixed(5);
            } else {
                d3.select(this).attr("placeholder", "none");
            }
        };

        function setBoolValueFromModel(d) {
            let object = d3.select($(this).parents("li.attribute").first().parent().get(0)).data()[0];
            let value = self.model.getAttribute(object, "cim:" + d.attributes[0].value.substring(1));
            if (typeof (value) !== "undefined") {
                d3.select(this).text(value.innerHTML);
            } else {
                d3.select(this).text("none");
            }
        };

        function setEnumValueFromModel(d) {
            let object = d3.select($(this).parents("li.attribute").first().parent().get(0)).data()[0];
            let value = self.model.getEnum(object, "cim:" + d.attributes[0].value.substring(1));
            if (typeof (value) !== "undefined") {
                let enumRef = value.attributes.getNamedItem("rdf:resource").value;
                d3.select(this).text(enumRef.split("#")[1].split(".")[1]);
            } else {
                d3.select(this).text("none");
            }
        };
        // set a boolean attribute according to user input
        function setBoolAttr(d) {
            // change the element's text
            let value = d3.select(this).node().textContent;
            $(this).parent().parent().find(">button>span.boolVal").text(value);
            let object = d3.select($(this).parents("li.attribute").first().parent().get(0)).data()[0];
            let attrName = "cim:" + d.attributes[0].value.substring(1);
            // update the model
            self.model.setAttribute(object, attrName, value);
        };
        // set an enum attribute according to user input
        function setEnumAttr(d) {
            // change the element's text
            $(this).parent().parent().find(">button>span.enumVal").text(d);
            let object = d3.select($(this).parents("li.attribute").first().parent().get(0)).data()[0];
            let attr = d3.select($(this).parents("li.attribute").first().get(0)).data()[0];
            let attrName = "cim:" + attr.attributes[0].value.substring(1);
            let value = self.model.schema.getSchemaEnumName(attr) + "." + d;
            // update the model
            self.model.setEnum(object, attrName, value);
        };

        function attrInput(d) {
            let object = d3.select($(this).parents("ul").first().get(0)).data()[0];
            let about = d.attributes.getNamedItem("rdf:about").value;
            let ns = "cim:";
            if (about.startsWith("#") === false) {
                ns = "entsoe:";
            }
            about = about.substring(about.indexOf("#") + 1);
            let attrName = ns + about;
            self.model.setAttribute(object, attrName, this.value);
        };
    }

    self.generateLinks = function (elementLink) {
        elementLink.append("div").attr("class", "input-group input-group-xs")
            .attr("class", "input-group-prepend").append("span").attr("class", "input-group-text cim-tree-attribute-name")
            // elementLink.attr("class", "input-group-prepend").append("span").attr("class", "input-group-text cim-tree-attribute-name")
            .html(function (d) {
                let about = d.attributes.getNamedItem("rdf:about").value;
                let fullName = about.split(".")[1];
                if (fullName.length > 20) {
                    fullName = fullName.substring(0, 20) + "...";
                }
                return fullName;
            });
        let elementLinkBtn = elementLink.append("div").attr("class", "btn-group cim-tree-btn-group");
        elementLinkBtn.append("button")
            .attr("class", "btn btn-outline-secondary btn-xs cimLinkBtn")
            //.attr("class","btn btn-outline-secondary cimLinkBtn")
            .attr("type", "submit")
            .on("click", function (d) {
                let targetUUID = "#" + d3.select(this).attr("cim-target");
                let hashComponents = window.location.hash.substring(1).split("/");
                let basePath = hashComponents[0] + "/" + hashComponents[1] + "/" + hashComponents[2];
                route(basePath + "/" + targetUUID.substring(1));
            })
            .attr("cim-target", function (d) {
                let source = d3.select($(this).parents("ul").first().get(0)).data()[0];
                let targetObj = self.model.getTargets(
                    [source],
                    d.attributes[0].value.substring(1))[0];
                if (typeof (targetObj) === "undefined") {
                    return "none";
                }
                return targetObj.attributes.getNamedItem("rdf:ID").value;
            })
            .html(function (d) {
                let targetObj = self.model.getObject(d3.select(this).attr("cim-target"));
                if (typeof (targetObj) === "undefined") {
                    d3.select(this).attr("disabled", "disabled");
                    return "none";
                }
                let name = self.model.getAttribute(targetObj, "cim:IdentifiedObject.name");
                if (typeof (name) !== "undefined") {
                    return name.innerHTML;
                }
                return "unnamed";
            });
        elementLinkBtn.append("button")
            //.attr("class","btn btn-outline-secondary")
            .attr("class", "btn btn-outline-secondary btn-xs")
            .attr("type", "submit")
            .on("click", function (d) {
                // handle the modification of links
                let linkToChange = d3.select(this.parentNode);
                let range = self.model.schema.getLinkRange(d);
                let treeItems = d3.select(".tree").selectAll(".tab-pane > .list-group > .list-group-item > div > ul");
                // we divide the tree items into two partitions: the
                // possible targets of the link and the non-targets.
                // TODO: check if there is a more efficient calculation
                // for the two partitions.
                let targets = treeItems.filter(function (d) {
                    let ret = false;
                    let cimObj = d3.select(this).select(".CIM-object");
                    if (cimObj.size() > 0) {
                        ret = self.model.schema.isA(range, cimObj.datum()) === true;

                        //Added By SS
                        if (range == "SubGeographicalRegion" && cimObj.datum().localName == "GeographicalRegion") {
                            ret = true;
                        }

                    }
                    return ret;
                });
                let nonTargets = treeItems.filter(function (d) {
                    let ret = true;
                    let cimObj = d3.select(this).select(".CIM-object");
                    if (cimObj.size() > 0) {
                        ret = self.model.schema.isA(range, cimObj.datum()) === false;

                        if (range == "SubGeographicalRegion" && cimObj.datum().localName == "GeographicalRegion") {
                            ret = false;
                        }
                    }
                    return ret;
                });
                self.enterSetLinkMode(linkToChange, targets, nonTargets);
            })
            .html("change");
        elementLinkBtn.append("button")
            //.attr("class","btn btn-outline-secondary")
            .attr("class", "btn btn-outline-secondary btn-xs")
            .attr("type", "submit")
            .attr("id", "cimRemoveBtn")
            .on("click", function (d) {
                let source = d3.select($(this).parents("ul").first().get(0)).data()[0];
                let linkName = "cim:" + d.attributes[0].value.substring(1);
                let target = self.model.getObject($(this).parent().find("[cim-target]").attr("cim-target"));
                self.model.removeLink(source, linkName, target);
            })
            .html(function () {
                let target = self.model.getObject($(this).parent().find("[cim-target]").attr("cim-target"));
                if (typeof (target) === "undefined") {
                    d3.select(this).attr("disabled", "disabled");
                }
                return "remove";
            });
    }

    self.setLink = function (linkToChange, source) {
        let target = d3.select($(linkToChange.node()).parents("ul").first().get(0)).data()[0];
        let targetUUID = target.attributes.getNamedItem("rdf:ID").value;
        if (source !== null) {
            let targetLink = linkToChange.data()[0];
            let targetLinkName = "cim:" + targetLink.attributes[0].value.substring(1);
            self.model.setLink(target, targetLinkName, source);
        }
        let hashComponents = window.location.hash.substring(1).split("/");
        let basePath = hashComponents[0] + "/" + hashComponents[1] + "/" + hashComponents[2];
        let shouldReplace = false;
        if (hashComponents.length > 3) {
            if (targetUUID === hashComponents[3]) {
                shouldReplace = true;
            }
        }
        route(basePath, null, shouldReplace);
        route(basePath + "/" + targetUUID, null, true);
    }

    // Enter mode for editing links.
    self.enterSetLinkMode = function (linkToChange, targets, nonTargets) {
        mode = "setLinks";
        $("#tree-link-dialog").removeClass("d-none");
        $("#tree-controls").addClass("d-none");
        targets.each(function (d) {
            let cimObjs = d3.select(this).selectAll(".CIM-object");
            cimObjs.select("button.cim-object-btn").classed("btn-primary", false).classed("btn-outline-dark", true);
            let checkBtn = cimObjs
                .insert("button", ":first-child")
                //.attr("class", "btn btn-outline-dark btn-sm cim-check-btn")
                .attr("class", "btn btn-outline-dark btn-xs cim-check-btn")
                .attr("type", "submit").on("click", function () {
                    d3.select(this.firstChild).attr("class", "far fa-check-square");
                    let source = d3.select(this).datum();
                    self.setLink(linkToChange, source);
                    self.exitSetLinkMode();
                });
            checkBtn.append("span")
                .attr("class", "far fa-square");
            //cimObjs.selectAll("a.cim-expand-object").classed("d-none", true);
        });

        $(nonTargets.nodes()).parent().parent().addClass("d-none").removeClass("d-flex");
        $(".tab-content > .tab-pane > ul", self.root).each(function () {
            if ($(this).children("li.d-flex").length === 0) {
                let tabToHide = $(this).parent().attr("id") + "Tab";
                $("#" + tabToHide).addClass("d-none");
            } else {
                let tabToShow = $(this).parent().attr("id") + "Tab";
                $("#" + tabToShow).tab("show");
            }
        });
        // handle escape key
        d3.select("body").on("keyup.tree", function () {
            if (d3.event.keyCode === 27) { // "Escape"
                self.exitSetLinkMode();
                self.setLink(linkToChange, null);
            }
        });
        // setup link dialog button
        d3.select("#tree-link-dialog-cancel").on("click", function () {
            self.exitSetLinkMode();
            self.setLink(linkToChange, null);
        });
    }

    // Exit mode for editing links.
    self.exitSetLinkMode = function () {
        mode = "default";
        $("#tree-link-dialog").addClass("d-none");
        $("#tree-controls").removeClass("d-none");
        let treeItems = d3.select(".tree").selectAll(".tab-pane > .list-group > .list-group-item > div > ul");
        treeItems.each(function (d) {
            let cimObjs = d3.select(this).selectAll(".CIM-object");
            cimObjs.selectAll("button.cim-check-btn").remove();
            cimObjs.select("button.cim-object-btn").classed("btn-primary", true).classed("btn-outline-dark", false);
            //cimObjs.selectAll("a.cim-expand-object").classed("d-none", false);
        });
        $(treeItems.nodes()).parent().parent().addClass("d-flex").removeClass("d-none");
        $(".tab-content > .tab-pane > ul", self.root).each(function () {
            let tabToShow = $(this).parent().attr("id") + "Tab";
            $("#" + tabToShow).removeClass("d-none");
        });
        d3.select("body").on("keyup.tree", null);
        d3.select("#tree-link-dialog-cancel").on("click", null);
    }

    self.moveTo = function (uuid) {
        if (typeof (uuid) === "undefined") {
            return;
        }
        let target = null,
            targetChild = null;
        let hoverD = self.model.getObject(uuid);
        if (typeof (hoverD) === "undefined") {
            return;
        }
        // handle nodes
        if (hoverD.nodeName === "cim:ConnectivityNode" || hoverD.nodeName === "cim:TopologicalNode") {
            // let's try to get a busbar section
            let busbarSection = self.model.getBusbar(hoverD);
            if (busbarSection === null) {
                return;
            }
            uuid = busbarSection.attributes.getNamedItem("rdf:ID").value;
        }
        targetChild = d3.select(".tree").select("#" + uuid).node();
        if (targetChild === null) {
            return;
        }
        target = targetChild.parentNode;
        d3.select(".tree").selectAll(".btn-danger").classed("btn-danger", false).classed("btn-primary", true);
        // show the relevant tab
        let tabId = $(target).parents("div.tab-pane").first().attr("id") + "Tab";
        if ($("#" + tabId).hasClass("active")) {
            self.scrollTo("#" + uuid);
        } else {
            $("#" + tabId).on("shown.bs.tab", function (event) {
                self.scrollTo("#" + uuid);
                $(this).off("shown.bs.tab");
            });
        }
        $("#" + tabId).tab("show");
        d3.select(target).select("button.cim-object-btn").classed("btn-danger", true).classed("btn-primary", false);
    }

    self.deleteObject = function (objectUUID) {
        let cimObject = d3.select("div.tree").select("ul#" + objectUUID).node();
        if (cimObject !== null) {
            let cimObjectContainer = cimObject.parentNode;
            // update element count
            $(cimObjectContainer)
                .parents("li.list-group-item")
                .first()
                //.find(">h4>span")
                .find(">h5>span")
                .each(function () {
                    let elementCount = parseInt($(this).html());
                    elementCount = elementCount - 1;
                    $(this).html(elementCount);
                });
            $(cimObjectContainer)
                .parents("li.cim-parent-container")
                //.find(">h4>span")
                .find(">h5>span")
                .each(function () {
                    let elementCount = parseInt($(this).html());
                    elementCount = elementCount - 1;
                    $(this).html(elementCount);
                });
            // remove object
            cimObjectContainer.remove();
        }
    }

    self.scrollTo = function (targetUUID) {
        if ($(targetUUID).parents(".collapse:not(.show)").length !== 0) {
            $(targetUUID).parents(".collapse:not(.show)").on("shown.bs.collapse", function (event) {
                event.stopPropagation();
                let elementEnter = d3.select(this.parentNode).filter(".CIM-object").select("ul");
                if (elementEnter.selectAll("li.attribute").size() === 0) {
                    self.generateAttrsAndLinks(elementEnter);
                }
                scrollToVisible(targetUUID);
                $(this).off("shown.bs.collapse");
            });
        } else {
            scrollToVisible(targetUUID);
        }
        $(targetUUID).parents(".collapse:not(.show)").collapse("show");

        function scrollToVisible(targetUUID) {
            $(".tab-content").scrollTop(
                $(".tab-content").scrollTop() + (
                    $(".tab-content").find(targetUUID).parent().offset().top - $(".tab-content").offset().top
                )
            );
        };
    }

    self.resetAttrs = function () {
        if ($("#sshInput").prop('checked') === true) {
            d3.select("#app-tree").selectAll("li.attribute:not(.SSH)").classed("d-none", true);
            d3.select("#app-tree").selectAll("li.link:not(.SSH)").classed("d-none", true);
            d3.select("#app-tree").selectAll("li.attribute.SSH").classed("d-none", false);
            d3.select("#app-tree").selectAll("li.link.SSH").classed("d-none", false);
        } else {
            d3.select("#app-tree").selectAll("li.attribute:not(.SSH)").classed("d-none", false);
            d3.select("#app-tree").selectAll("li.link:not(.SSH)").classed("d-none", false)
            d3.select("#app-tree").selectAll("li.attribute.SSH").classed("d-none", true);
            d3.select("#app-tree").selectAll("li.link.SSH").classed("d-none", true);
        }
    }
}