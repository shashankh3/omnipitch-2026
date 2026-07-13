import { describe, it, expect, beforeEach } from 'vitest';
import { evaluateAlerts, resetAlertState } from '../proactiveAlerts';
import type { StadiumTelemetry } from '../../types';

describe('proactiveAlerts', () => {
  beforeEach(() => {
    resetAlertState();
  });

  const getBaseTelemetry = (): StadiumTelemetry => ({
    timestamp: new Date().toISOString(),
    wbgtTemperature: 25,
    gateThroughput: { GateA: 100, GateB: 100, GateC: 100 },
    transitDelays: { Metro_Line1: 5 },
    concessionInventory: { Water_Sec100: 80 },
    crowdDensity: { 'North Stand': 50, 'South Stand': 50, 'East Stand': 50, 'West Stand': 50 }
  });

  it('does not trigger alerts when conditions are normal', () => {
    const alerts = evaluateAlerts(getBaseTelemetry());
    expect(alerts.length).toBe(0);
  });

  it('triggers heat_hazard when wbgtTemperature >= 35', () => {
    const telemetry = getBaseTelemetry();
    telemetry.wbgtTemperature = 35;
    const alerts = evaluateAlerts(telemetry);
    expect(alerts.length).toBe(1);
    expect(alerts[0].ruleId).toBe('heat_hazard');
    expect(alerts[0].severity).toBe('HIGH');
  });

  it('triggers gate_c_surge when throughput >= 1000', () => {
    const telemetry = getBaseTelemetry();
    telemetry.gateThroughput['GateC'] = 1001;
    const alerts = evaluateAlerts(telemetry);
    expect(alerts.length).toBe(1);
    expect(alerts[0].ruleId).toBe('gate_c_surge');
  });

  it('triggers crowd_critical_east when density >= 90', () => {
    const telemetry = getBaseTelemetry();
    telemetry.crowdDensity['East Stand'] = 90;
    const alerts = evaluateAlerts(telemetry);
    expect(alerts.length).toBe(1);
    expect(alerts[0].ruleId).toBe('crowd_critical_east');
    expect(alerts[0].severity).toBe('CRITICAL');
  });

  it('deduplicates consecutive alerts for the same rule', () => {
    const telemetry = getBaseTelemetry();
    telemetry.wbgtTemperature = 36;
    
    // First evaluation triggers alert
    const firstAlerts = evaluateAlerts(telemetry);
    expect(firstAlerts.length).toBe(1);
    
    // Second evaluation with same condition does not trigger again
    const secondAlerts = evaluateAlerts(telemetry);
    expect(secondAlerts.length).toBe(0);
    
    // Condition goes back to normal
    telemetry.wbgtTemperature = 25;
    evaluateAlerts(telemetry);
    
    // Condition becomes critical again, triggers anew
    telemetry.wbgtTemperature = 37;
    const thirdAlerts = evaluateAlerts(telemetry);
    expect(thirdAlerts.length).toBe(1);
  });

  it('generates unique UUIDs for each alert instance', () => {
    const telemetry = getBaseTelemetry();
    telemetry.wbgtTemperature = 36;
    const a1 = evaluateAlerts(telemetry)[0];
    
    telemetry.wbgtTemperature = 20;
    evaluateAlerts(telemetry);
    
    telemetry.wbgtTemperature = 36;
    const a2 = evaluateAlerts(telemetry)[0];
    
    expect(a1.id).not.toBe(a2.id);
  });
});
