/*jshint esversion: 6*/
const synaptic = require('synaptic');
const { Layer, Network } = synaptic;

Perceptron = function(input, hidden, output) {
	// create the layers
	var inputLayer = new Layer(input);
	var hiddenLayer = new Layer(hidden);
	var outputLayer = new Layer(output);

	// connect the layers
	inputLayer.project(hiddenLayer);
	hiddenLayer.project(outputLayer);

	// set the layers
	this.set({
		input: inputLayer,
		hidden: [hiddenLayer],
		output: outputLayer
	});
};

Perceptron.prototype = new Network();
Perceptron.prototype.constructor = Perceptron;