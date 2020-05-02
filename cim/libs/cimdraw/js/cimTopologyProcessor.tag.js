"use strict";

function cimTopologyProcessorTag(opts) {

    let self = this;

    self.parent.on("diagrams", function () {
        $("#cim-topology-processor").show();
    });

    self.run = function (e) {
        $("#tpMsg").text("Loading...");
        $("#tpStatusModal").modal("show");
        $("#tpStatusModal").on("shown.bs.modal", function (e) {
            let topos = topologyProcessor(opts.model).calcTopology();
            $("#tpMsg").text("Done (" + topos.length + " nodes calculated).");
        });
    }
}