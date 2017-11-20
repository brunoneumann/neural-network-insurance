/*jshint esversion: 6*/
import { Template } from 'meteor/templating';
import './perceptron.js';
import './app.html';

let myGlobalNetwork;

Template.app.onCreated(function appOnCreated() {
    this.state = new ReactiveDict();
    this.state.set("loaded", false);
});

Template.app.helpers({
    'result': function() {
        return Template.instance().state.get("result");
    },
    'loaded': function() {
        return Template.instance().state.get("loaded");
    },
    'rows': function() {
        return Template.instance().state.get("rows");
    }
});

Template.app.events({
    'change #fileInput': function(e, template) {
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            var instance = template.state;
            readFile(e, function(data) {
                trainNetwork(data, instance);
            });
        }
    },

    'submit .test-neural-network': function(e, template) {
        e.preventDefault();
        if (myGlobalNetwork) {
            var input = $("#valueTest").val();
            var arrInput = input.split(',').map(Number);
            var result = myGlobalNetwork.activate(arrInput);
            console.log(result);
            template.state.set("result", result);
            
            setTimeout(function(){
                window.scrollTo(0,document.body.scrollHeight);
            }, 200);
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
    var myNetwork = new Perceptron(15, hiddenLayers, 1);
    
    // train the network - learn XOR

    for (var r = 0; r < 10000; r++) {
        for (var i = 0; i < s.length; i++) {
            
            var num = s[i].split(',').map(Number);

            if (num.length === 16) {
                myNetwork.activate([num[0], num[1], num[2], num[3], num[4], num[5], num[6], num[7], num[8], num[9], num[10], num[11], num[12], num[13], num[14]]);
                myNetwork.propagate(learningRate, [num[15]]);
            }
        }
    }

    myGlobalNetwork = myNetwork;
    instance.set("loaded", true);
    instance.set("rows", s.length);
};