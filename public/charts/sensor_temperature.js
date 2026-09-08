window.CHARTS = window.CHARTS || {};
window.CHARTS.sensor_temperature = {
  id:             'sensor_temperature',
  title:          'Sensor Temperature',
  sub:            'system.hw.sensor.temperature.input',
  unit:           '°C',
  endpoint:       '/sensordata',
  chartPrefix:    'temperature',
  requires:       'sensor.temperature',
  noStats:        true,
  colors:         [],
  nav:            { group: 'Sensors', section: 'Temperature' },
};
