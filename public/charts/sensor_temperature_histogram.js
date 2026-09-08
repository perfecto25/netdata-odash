window.CHARTS = window.CHARTS || {};
// Heatmap: Y is the temperature bucket, colour is how many probes sit in it.
window.CHARTS.sensor_temperature_histogram = {
  id:       'sensor_temperature_histogram',
  title:    'Temperature Sensors Distribution',
  sub:      'system.hw.sensor.temperature.histogram',
  chart:    'sensors.temperature_histogram',
  unit:     '°C',
  display:  'heatmap',
  requires: 'sensor.temperature',
  nav:      { group: 'Sensors', section: 'Temperature' },
};
