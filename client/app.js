/*jshint esversion: 6*/
import { Template } from 'meteor/templating';
const { Trainer } = require('synaptic');
import './perceptron.js';
import './app.html';

let myGlobalNetwork;

Template.app.onCreated(function appOnCreated() {
    this.state = new ReactiveDict();
    this.state.set("loaded", false);
    this.state.set("error", false);
});

Template.app.helpers({
    'result': function() {
        return Template.instance().state.get("result");
    },
    'loaded': function() {
        return Template.instance().state.get("loaded");
    },
    'error': function() {
        return Template.instance().state.get("error");
    },
    'rows': function() {
        return Template.instance().state.get("rows");
    },
    'input': function() {
        return Template.instance().state.get("input");
    },
    'output': function() {
        return Template.instance().state.get("output");
    },
    'insurance': function() {
        return Template.instance().state.get("insurance");
    }

});

Template.app.events({

    'submit .test-neural-network': function(e, template) {
        e.preventDefault();
        var input = [];
        var output = [];
        var age = toBinary($("#age").val());
        var gender = $('input[name=gender]:checked').val();
        var physic = $('input[name=physic]:checked').val();
        var smoker = $('input[name=smoker]:checked').val();
        var disease = $('input[name=disease]:checked').val();
        var risk = $('input[name=risk]:checked').val();

        var arrayTemp = age.split('');
        var secondArray = [gender, physic, smoker, disease, risk];
        arrayTemp = arrayTemp.concat(secondArray);

        var trainArray = arrayTemp.map(function(num) {
            return parseInt(num);
        });

        input.push(trainArray);

        if (myGlobalNetwork) {

            var result = myGlobalNetwork.activate(trainArray);
            var best = bestInsurance(result);
            console.log(best);

            output = output.concat(resultLogs(result));

            template.state.set("insurance", best);
            template.state.set("result", result);
            template.state.set("input", input);
            template.state.set("output", output);

            setTimeout(function() {
                window.scrollTo(0, document.body.scrollHeight);
            }, 200);
        }
    },

    'change #fileInput': function(e, template) {
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            var instance = template.state;
            template.state.set("error", false);
            readFile(e, function(data) {
                trainNetwork(data, instance);
            });
        }
    },

    'keyup [id=learningRate]': function(e) {
        var learningRate = e.target.value.trim();
        var hiddenLayers = $("#hiddenLayers").val();
        if (learningRate && hiddenLayers) {
            $("#fileInputButton").removeClass("disabled");
            $("#fileInput").prop('disabled', false);
        } else {
            $("#fileInputButton").addClass("disabled");
            $("#fileInput").prop('disabled', true);
        }
    },
    'keyup [id=hiddenLayers]': function(e) {
        var hiddenLayers = e.target.value.trim();
        var learningRate = $("#learningRate").val();
        if (learningRate && hiddenLayers) {
            $("#fileInputButton").removeClass("disabled");
            $("#fileInput").prop('disabled', false);
        } else {
            $("#fileInputButton").addClass("disabled");
            $("#fileInput").prop('disabled', true);
        }
    }
});

readFile = function(evt, callback) {
    var files = evt.target.files;
    var file = files[0];
    var reader = new FileReader();
    reader.onload = function(event) {
        callback(event.target.result);
    };
    reader.readAsText(file);
};

trainNetwork = function(data, instance) {

    var s = data.split("\n"); // Caution with this!
    /* The learning rate is a variable used during backpropagation, specificely during the weight and bias update. Basically, the algorithm calculates if a weight should be larger or smaller, basically a direction to go to for the weight (up/down). The learning rate tells the algorithm: we should move this much higher, not too much, so we don't surpass the target, and not too little, otherwise we won't learn anything. */
    var learningRate = parseFloat($("#learningRate").val());
    var hiddenLayers = parseInt($("#hiddenLayers").val());

    var myNetwork = new Perceptron(
        12, // Input
        hiddenLayers, // Hidden layers
        3 // Output array size
    );

    var error = false;
    var rows = 0;
    for (var r = 0; r < 100; r++) {
        for (var i = 0; i < s.length; i++) {

            if (s[i]) {
                if (testColumns(s[i])) {
                    var num = s[i].split(';').map(Number);

                    myNetwork.activate([num[0], num[1], num[2], num[3], num[4], num[5], num[6], num[7], num[8], num[9], num[10], num[11]]);

                    myNetwork.propagate(learningRate, [
                        num[12], // Basic
                        num[13], // Intermediary
                        num[14], // Complete
                    ]);

                    if (r === 0) {
                        rows++;
                    }

                } else {
                    error = true;
                    break;
                }
            }
        }
    }

    if (error) {
        instance.set("error", true);
    }

    myGlobalNetwork = myNetwork;
    instance.set("loaded", true);
    instance.set("rows", rows);
};


testColumns = function(line) {
    var reg = new RegExp('\\;', 'g');
    var size = parseInt((line.match(reg) || []).length);
    if (size == 14) {
        return true;
    }
    return false;
};

toBinary = function(num) {
    var bits = (parseInt(num)).toString(2);
    var pad = "0000000";
    return (pad + bits).slice(-pad.length);
};

resultLogs = function(results) {
    var logs = [];
    for (var i = 0; i < results.length; i++) {
        logs.push(i + " - " + results[i]);
    }
    return logs;
};

bestInsurance = function(results) {
    var best = 0;
    var index = 0;
    for (var i = 0; i < results.length; i++) {
        if (results[i] > best) {
            best = results[i];
            index = i;
        }
    }
    var obj = {
        result: best,
        name: getNameInsurance(index),
        percent: Math.round((best * 100))
    };
    return obj;
};

getNameInsurance = function(index) {
    switch (index) {
        case 0:
            return "Basic";
        case 1:
            return "Intermediary";
        case 2:
            return "Complete";
        default:
            return "";
    }
};