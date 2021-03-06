function addDataset(chart, labels, data) {
    //chart.data.labels.push(labels);
    chart.data.datasets.push(data);
    chart.update();
}
function removeDataset(chart) {
    //chart.data.labels = [];
    chart.data.datasets = [];
    chart.update();
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function updateCounter(name, value) {
    $({ counter: 0 }).animate({ counter: value }, {
        duration: 1500,
        easing: 'swing', // can be anything
        step: function() { // called on every step
            // Update the element's text with rounded-up value:
            $(name).text(numberWithCommas(Math.round(this.counter)));
        }
    });
}

function colorize(opaque, hover, ctx) {
    var v = ctx.dataset.data[ctx.dataIndex];
    var c = v < -50 ? '#D60000'
        : v < 0 ? '#F46300'
        : v < 50 ? '#0358B6'
        : '#44DE28';
    var opacity = hover ? 1 - Math.abs(v / 150) - 0.2 : 1 - Math.abs(v / 150);
    return opaque ? c : transparentize(c, opacity);
}

function hoverColorize(ctx) {
    return colorize(false, true, ctx);
}

function transparentize(color, opacity) {
    var alpha = opacity === undefined ? 0.5 : 1 - opacity;
    return Color(color).alpha(alpha).rgbString();
}

function randomColor() {
    return Math.floor(Math.random()*16777215).toString(16);
}

function getTodaysDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = `${yyyy}-${mm}-${dd}`;
    return today;
}