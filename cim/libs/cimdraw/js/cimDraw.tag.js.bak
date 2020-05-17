"use strict";

function cimDrawTag(opts) {

    let self = this;

    let cimFile = {};
    let cimFileReader = {};

    self.cimModel = cimModel();

    let diagramsToLoad = 2;

    const fileSelect = document.getElementById("fileSelect"),
        fileElem = document.getElementById("fileElem");

    fileSelect.addEventListener("click", function (e) {
        if (fileElem) {
            fileElem.click();
        }
        e.preventDefault(); // prevent navigation to "#"
    }, false);

    fileElem.addEventListener("change", handleFiles, false);

    function handleFiles() {
        if (!this.files.length) {

        } else {

            for (let i = 0; i < this.files.length; i++) {
                cimFile = this.files[0];
                cimFileReader = new FileReader();
                $("#cim-load").attr("href", "#" + encodeURI(cimFile.name) + "/diagrams");
                //$("#cim-load").click();
                self.cimModel.clear();
                self.update();
                self.trigger("cleanUp")

                document.getElementById('cim-load').click();

                break;
            }
        }
    }

    self.cimModel.on("setMode", function (mode) {
        if (mode === "NODE_BREAKER") {
            $("#cim-mode").text("Mode: Operational");
            $("#tree-control-power-flow-input").css("display", "none");
        } else {
            $("#cim-mode").text("Mode: Planning");
            $("#tree-control-power-flow-input").css("display", "initial");
        }
    });

    self.on("loaded", function () {
        diagramsToLoad = diagramsToLoad - 1;
        if (diagramsToLoad === 0) {
            $("#loadingModal").modal("hide");
            $("#loadingDiagramMsg").text("loading diagram...");
            diagramsToLoad = 2;
        }
    });

    self.on("mount", function () {
        route.stop(); // clear all the old router callbacks
        // let cimFile = {};
        // let cimFileReader = {};
        $(".selectpicker").selectpicker();

        $("#operational").change(function () {
            self.cimModel.setMode("NODE_BREAKER");
        });

        $("#planning").change(function () {
            self.cimModel.setMode("BUS_BRANCH");
        });

        $("#cim-create-new-container").on("click", function () {
            cimFile = {
                name: "new1"
            };
            cimFileReader = null;
            $("#cimModeModal").modal("show");

            //new Code hiding operational/planning code... Assed by SS
            // cimFile = {
            //     name: "new1"
            // };
            // cimFileReader = null;
            // route("/" + cimFile.name + "/diagrams");

        });

        // Button shown in loading modal in case of errors.
        $("#cim-loading-modal-error").on("click", function () {
            $("#loadingModal").modal("hide");
            route("/");
        });

        // Button shown in boundary modal in case of errors.
        $("#cim-boundary-modal-error").on("click", function () {
            $("#boundaryModal").modal("hide");
            $("#boundaryMsg").text("loading boundary file...");
        });

        $("#cim-create-new-modal").on("click", function () {
            route("/" + cimFile.name + "/diagrams");
        });

        $("#load-boundary").on("click", function () {
            document.getElementById('upload-boundary').click();
            return false;
        });

        $("#upload-boundary").change(function () {
            const bdFile = this.files[0];
            $("#boundaryModal").off("shown.bs.modal");
            $("#boundaryModal").on("shown.bs.modal", function (e) {
                self.cimModel.loadBoundary(bdFile).then(function (result) {
                    $("#boundaryMsg").append("<br>OK. " + result);
                    $("#cim-boundary-modal-error-container").show();
                }).catch(function (e) {
                    $("#boundaryMsg").append("<br>" + e);
                    $("#cim-boundary-modal-error-container").show();
                });
            });
            $("#boundaryModal").modal("show");
        });

        // This is the initial route ("the home page").
        route(function (name) {
            // things to show
            $("#cim-local-file-component").show();
            // things to hide
            $("#app-container").hide();
            //$("#cim-load-container").hide();
            $("#cim-home-container").hide();
            $(".selectpicker").selectpicker("hide");
            $("#cim-mode").hide();
            $("#cim-topology-processor").hide();
            $("#cim-loading-modal-error-container").hide();
            $("#cim-boundary-modal-error-container").hide();
            // main logic
            d3.select("#cim-diagrams").selectAll("option").remove();
            d3.select("#cim-diagrams").append("option").attr("disabled", "disabled").html("Select a diagram");
            d3.select("#cim-filename").html("");
            $(".selectpicker").selectpicker("refresh");
            // initialize the fileinput component
            // $("#cim-file-input").fileinput({
            //     theme: "fa"
            // });
            // $("#cim-file-input").fileinput("clear");
            // // what to do when the user loads a file
            // $("#cim-file-input").on("fileloaded", function (event, file, previewId, index, reader) {
            //     cimFile = file;
            //     cimFileReader = reader;
            //     $("#cim-load").attr("href", "#" + encodeURI(cimFile.name) + "/diagrams");
            //     //$("#cim-load-container").show();
            // });
            // // sometimes we must hide the 'load file' button
            // $('#cim-file-input').on('fileclear', function (event) {
            //     //$("#cim-load-container").hide();
            // });            
        });

        // here we choose a diagram to display
        route('/*/diagrams', function () {
            // things to show
            $("#cim-home-container").show();
            $(".selectpicker").selectpicker("show");
            //$("#cim-mode").show();
            // things to hide
            $("#cim-local-file-component").hide();
            $("#app-container").hide();
            $("#cim-export").parent().addClass("disabled");
            $("#cimModeModal").modal("hide");
            // main logic
            if (cimFile.name === d3.select("#cim-filename").html()) {
                // nothing to do in this case, just refresh the diagram list
                loadDiagramList(cimFile.name);
                return;
            }
            $("#loadingDiagramMsg").text("loading CIM network...");
            $("#loadingModal").off("shown.bs.modal");
            $("#loadingModal").on("shown.bs.modal", function (e) {
                if (typeof (cimFile.name) !== "undefined") {
                    d3.select("#cim-filename").html("[" + cimFile.name + "]&nbsp&nbsp");
                    self.cimModel.load(cimFile, cimFileReader).then(function () {
                        loadDiagramList(cimFile.name);
                        $("#loadingModal").modal("hide");
                        if (cimFile.name !== "new1") {
                            selectMode();
                        }

                        //Added By Satyam Singh
                        let diagrams = self.cimModel.getDiagramList();

                        if (diagrams.length > 0) {
                            self.showDefaultDiagram(cimFile.name, diagrams[0]);
                            setTimeout(function () {
                                loadDiagram(cimFile.name, diagrams[0]);
                            }, 1000);
                        }

                    }).catch(function (e) {
                        $("#loadingDiagramMsg").append("<br>" + e);
                        $("#cim-loading-modal-error-container").show();
                    });
                } else {
                    $("#loadingModal").modal("hide");
                    route("/");
                    return;
                }

                function selectMode() {
                    let nodes = self.cimModel.getObjects(["cim:ConnectivityNode", "cim:TopologicalNode"]);
                    let cns = nodes["cim:ConnectivityNode"];
                    let tns = nodes["cim:TopologicalNode"];
                    cns = cns.filter(function (el) {
                        return self.cimModel.isBoundary(el) === false;
                    });
                    if (cns.length > 0 || tns.length === 0) {
                        self.cimModel.setMode("NODE_BREAKER");
                    } else {
                        self.cimModel.setMode("BUS_BRANCH");
                    }
                };
            });
            $("#loadingModal").modal("show");
            self.trigger("diagrams");
        });

        // here we show a certain diagram
        route('/*/diagrams/*', function (file, name) {
            if (typeof (cimFile.name) === "undefined") {
                route("/");
                return;
            }
            if (self.cimModel.activeDiagramName === decodeURI(name)) {
                self.trigger("showDiagram", file, name);
                $("#app-container").show();
                $(".selectpicker").selectpicker("val", decodeURI("#" + file + "/diagrams/" + name));
                return; // nothing more to do;
            }
            $("#cim-local-file-component").hide();
            $("#loadingDiagramMsg").text("loading diagram...");
            $("#loadingModal").off("shown.bs.modal");
            $("#loadingModal").modal("show");
            $("#loadingModal").on("shown.bs.modal", function (e) {
                loadDiagram(file, name);
            });
        });

        // creates a new model if it doesn't exist, and shows a diagram.
        function loadDiagram(file, name, element) {
            self.cimModel.loadRemote("/" + file).then(function () {
                showDiagram();

                //Added by Satyam Singh
                self.cimModel.registerUndoService();
                
            }).catch(function (e) {
                $("#loadingDiagramMsg").append("<br>" + e);
                $("#cim-loading-modal-error-container").show();
            });

            function showDiagram() {
                self.cimModel.selectDiagram(decodeURI(name));
                loadDiagramList(decodeURI(file));
                $(".selectpicker").selectpicker("val", decodeURI("#" + file + "/diagrams/" + name));
                self.trigger("showDiagram", file, name, element);
                $("#app-container").show();

                self.update();

                // allow exporting a copy of the diagram 
                $("#cim-export").on("click", function () {
                    let out = self.cimModel.export();
                    let blob = new Blob([out], {
                        type: "text/xml"
                    });
                    let objectURL = URL.createObjectURL(blob);
                    $("#cim-export").attr("href", objectURL);
                });
                $("#cim-export").parent().removeClass("disabled");
            };
        };

        /*setTimeout(function(){
        loadDiagram("new1","1");
        },3000);  */

        function loadDiagramList(filename) {
            $("#cim-save").off("click");
            // allow saving a copy of the file as plain XML
            $("#cim-save").on("click", function () {
                let out = self.cimModel.save();
                let blob = new Blob([out], {
                    type: "text/xml"
                });
                let objectURL = URL.createObjectURL(blob);
                $("#cim-save").attr("href", objectURL);
            });
            $("#cgmes-save").off("click");
            // allow saving a copy of the file as CGMES
            $("#cgmes-save").on("click", cgmesSave);

            function cgmesSave() {
                let out = self.cimModel.saveAsCGMES();
                out.then(function (content) {
                    let objectURL = URL.createObjectURL(content);
                    $("#cgmes-download").attr("href", objectURL);
                    document.getElementById("cgmes-download").click();
                }).catch(function (reason) {
                    console.log(reason);
                });
            };
            $("#matpower-export").off("click");
            // allow saving a copy of the file as plain XML
            $("#matpower-export").on("click", function () {
                let out = exportToMatpower(self.cimModel);
                let blob = new Blob([out], {
                    type: "text/plain"
                });
                let objectURL = URL.createObjectURL(blob);
                $("#matpower-export").attr("href", objectURL);
            });

            // load diagram list
            $(".selectpicker").selectpicker();
            d3.select("#cim-diagrams").selectAll("option").remove();
            d3.select("#cim-diagrams").append("option").attr("disabled", "disabled").html("Select a diagram");
            $(".selectpicker").selectpicker("refresh");
            d3.select("#cim-diagrams").append("option")
                .attr("value", "#" + filename + "/createNew")
                .text("Generate a new diagram");
            let diagrams = self.cimModel.getDiagramList();
            for (let i in diagrams) {
                d3.select("#cim-diagrams").append("option").attr("value", "#" + filename + "/diagrams/" + diagrams[i]).text(diagrams[i]);
            }
            $(".selectpicker").selectpicker("refresh");
            if (diagrams.length === 0) {
                route(filename + "/createNew");
            }
        };

        self.showDefaultDiagram = function (file, name, element) {

            let hashComponents = window.location.hash.substring(1).split("/");
            let basePath = hashComponents[0] + "/diagrams/";
            let fullPath = basePath + name;
            route(fullPath);

        };

        route("/*/diagrams/*/*", function (file, name, element) {
            $("#cim-local-file-component").hide();
            self.trigger("showDiagram", file, name, element);
        });

        route("/*/createNew", function (file) {
            //todo.. remove this when Operation/Planning mode gets active...
            window.history.back();

            $("#newDiagramModal").modal("show");
            d3.select("#newDiagramBtn").on("click", function () {
                let diagramName = d3.select("#newDiagramName").node().value;
                let hashComponents = window.location.hash.substring(1).split("/");
                let basePath = hashComponents[0] + "/diagrams/";
                let fullPath = basePath + diagramName;
                $('#newDiagramModal').modal("hide");
                route(fullPath);
            });
        });

        // start router
        route.start(true);
    });
}