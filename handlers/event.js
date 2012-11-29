/*jshint node:true*/

"use strict";

var esprima = require('esprima'),
    escodegen = require('escodegen');


var yui2nodeId = function (node) {
    if (node.type == esprima.Syntax.Literal) {
        node.value = '#'+node.value;
    }
};

var handlers = {

    
    // TODO: YAHOO.util.CustomEvent


    "YAHOO.util.Event.onDOMReady": function (node, path) {
        node.callee = {
            "type": "Identifier",
            "name": "// TODO: remove the call to YAHOO.util.Event.onDOMReady\nYAHOO.util.Event.onDOMReady"
        };
        return ['node'];
    },


    "YAHOO.util.Event.onContentReady": function (node, path) {

        node.callee = {
            "type": "Identifier",
            "name": "Y.on"
        };

        node.arguments.push(node.arguments[0]);
        yui2nodeId(node.arguments[2]);

        node.arguments[0] = {
            "type": "Literal",
            "value": "contentready"
        };
        return ['event'];
    },

    "YAHOO.util.Event.addListener": function (node, path) {
        var firstArg = node.arguments.shift();
        yui2nodeId(firstArg);
        
        node.callee = {
            "type": "Identifier",
            "name": "Y.one("+escodegen.generate(firstArg)+").on"
        };

        return ['node', 'event'];
    },

    "YAHOO.util.Event.getTarget": function (node, path) {

        var event = node.arguments[0];

        node.type = "MemberExpression";
        node.object = event;
        node.property = {
            "type": "Identifier",
            "name": "target"
        };

        return ['node', 'event'];
    },

    "YAHOO.util.Event.stopEvent": function (node, path) {

        var event = node.arguments[0];

        node.type = "MemberExpression";
        node.object = event;
        node.property = {
            "type": "Identifier",
            "name": "halt()"
        };

        return ['event'];
    },

    "YAHOO.util.Event.onAvailable": function (node, path) {
        // arguments = [ node/string, function ]

        node.callee = {
            "type": "Identifier",
            "name": "Y.on"
        };

        var n = node.arguments[0];
        yui2nodeId(n);

        node.arguments[0] = {
            type: 'Literal',
            value: 'available'
        };

        node.arguments.push(n);

        return ['node', 'event'];
    }

};


// Gestion des alias
for (var k in handlers) {
    var evtMethod = k.substr(17);
    handlers["Event."+evtMethod] = handlers[k];
    handlers["EVT."+evtMethod] = handlers[k];
}



exports.handlers = handlers;

