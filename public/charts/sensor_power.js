window.CHARTS = window.CHARTS || {};
window.CHARTS.sensor_power = {
  id:             'sensor_power',
  title:          'Sensor Power',
  sub:            'system.hw.sensor.power.input',
  unit:           'W',
  endpoint:       '/sensordata',
  chartPrefix:    'power',
  requires:       'sensor.power',
  colors:         [],
  nav:            { group: 'Sensors', section: 'Power' },
};
