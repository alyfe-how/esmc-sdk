/**
 * ════════════════════════════════════════════════════════════════
 * ESMC SDK v5.0 © 2025 Abelitie Designs Malaysia
 * Build: 2026-01-22 | https://esmc-sdk.com
 * ════════════════════════════════════════════════════════════════
 * ⚠️  PROPRIETARY SOFTWARE - Licensed, Not Sold
 *
 *    ESMC is a commercial AI-powered development framework.
 *    Unauthorized use, copying, or distribution is strictly
 *    prohibited and will be prosecuted to the fullest extent
 *    of applicable law.
 *
 *    If you obtained this without purchase or valid license:
 *    → Report to: security@esmc-sdk.com
 *    → Purchase at: https://esmc-sdk.com
 * ════════════════════════════════════════════════════════════════
 */
/** ESMC 3.1 OBSERVABILITY SYSTEM | 2025-09-04 | v3.1.0 | PROD | TIER 2
 *  Purpose: Enterprise observability with real-time operational intelligence for ESMC
 *  Features: Real-time monitoring | Performance metrics | Health checks | Alerts | Analytics | Operational intelligence
 */

const fs = require('fs').promises;
const path = require('path');
// 🆕 ESMC 4.1: mysql2 moved to dynamic require for SDK compatibility (graceful fallback)

/**
 * Enterprise-Grade Observability System for ESMC Operations
 * Provides real-time monitoring, metrics collection, and operational intelligence
 */
class ESMCObservabilitySystem {
    constructor() {
        this.metrics = new Map();
        this.healthChecks = new Map();
        this.alerts = [];
        this.analytics = {
            missionSuccess: 0,
            missionFailure: 0,
            avgDeploymentTime: 0,
            colonelPerformance: new Map()
        };
        this.startTime = Date.now();
        this.isMonitoring = false;
        this.dbConfig = {
            host: 'localhost',
            user: 'root',
            password: process.env.DB_PASSWORD || '',
            database: 'battlefield_intelligence'
        };
    }

    /**
     * Initialize the observability system
     * @returns {Object} Initialization status and metrics
     */
    async initialize() {
        const initStart = Date.now();
        
        try {
            // Initialize core monitoring components
            await this._initializeMetricsCollection();
            await this._initializeHealthChecks();
            await this._initializeAlertSystem();
            await this._loadHistoricalAnalytics();
            
            this.isMonitoring = true;
            const initTime = Date.now() - initStart;
            
            this._recordMetric('system.initialization_time', initTime);
            this._recordMetric('system.status', 'OPERATIONAL');
            
            return {
                status: 'INITIALIZED',
                initializationTime: initTime,
                componentsLoaded: ['metrics', 'healthChecks', 'alerts', 'analytics'],
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
    console.error('❌ Operation failed:', error.message);
    // Recovery mechanism - graceful degradation
    
            this._recordAlert('CRITICAL', 'System initialization failed', error.message);
            throw new Error(`Observability system initialization failed: ${error.message
}`);
        }
    }

    /**
     * Record real-time metrics for ESMC operations
     * @param {string} metric - Metric identifier
     * @param {*} value - Metric value
     * @param {Object} metadata - Additional context
     */
    _recordMetric(metric, value, metadata = {}) {
        const timestamp = Date.now();
        const metricData = {
            value,
            timestamp,
            metadata
        };

        if (!this.metrics.has(metric)) {
            this.metrics.set(metric, []);
        }
        
        this.metrics.get(metric).push(metricData);
        
        // Keep only last 1000 data points per metric
        const metricArray = this.metrics.get(metric);
        if (metricArray.length > 1000) {
            metricArray.splice(0, metricArray.length - 1000);
        }
    }

    /**
     * Start mission monitoring for a specific ESMC deployment
     * @param {string} missionId - Unique mission identifier
     * @param {Array} colonels - Colonels being deployed
     * @returns {Object} Mission monitoring session
     */
    async startMissionMonitoring(missionId, colonels = []) {
        const missionStart = Date.now();
        
        const missionData = {
            missionId,
            colonels,
            startTime: missionStart,
            status: 'ACTIVE',
            phases: [],
            metrics: new Map(),
            alerts: []
        };

        this._recordMetric('mission.started', 1, { missionId, colonels });
        this._recordMetric(`mission.${missionId}.start_time`, missionStart);

        // Initialize colonel performance tracking
        colonels.forEach(colonel => {
            this._recordMetric(`colonel.${colonel}.deployment_count`, 1);
            if (!this.analytics.colonelPerformance.has(colonel)) {
                this.analytics.colonelPerformance.set(colonel, {
                    deployments: 0,
                    successRate: 100,
                    avgExecutionTime: 0,
                    errors: 0
                });
            }
        });

        return missionData;
    }

    /**
     * Track colonel deployment performance
     * @param {string} missionId - Mission identifier
     * @param {string} colonel - Colonel identifier
     * @param {string} phase - Deployment phase
     * @param {number} duration - Execution duration in ms
     * @param {boolean} success - Success status
     */
    trackColonelDeployment(missionId, colonel, phase, duration, success = true) {
        const timestamp = Date.now();
        
        // Record deployment metrics
        this._recordMetric(`colonel.${colonel}.execution_time`, duration, { 
            missionId, 
            phase, 
            success 
        });
        this._recordMetric(`colonel.${colonel}.phase.${phase}`, success ? 1 : 0);
        this._recordMetric('system.colonel_deployments', 1);

        // Update analytics
        const colonelStats = this.analytics.colonelPerformance.get(colonel) || {
            deployments: 0,
            successRate: 100,
            avgExecutionTime: 0,
            errors: 0
        };

        colonelStats.deployments++;
        if (!success) {
            colonelStats.errors++;
        }
        colonelStats.successRate = ((colonelStats.deployments - colonelStats.errors) / colonelStats.deployments) * 100;
        colonelStats.avgExecutionTime = ((colonelStats.avgExecutionTime * (colonelStats.deployments - 1)) + duration) / colonelStats.deployments;

        this.analytics.colonelPerformance.set(colonel, colonelStats);

        // Alert on poor performance
        if (colonelStats.successRate < 85 && colonelStats.deployments > 5) {
            this._recordAlert('WARNING', 
                `Colonel ${colonel} success rate below threshold`, 
                `Current rate: ${colonelStats.successRate.toFixed(1)}%`
            );
        }
    }

    /**
     * Complete mission monitoring and record final analytics
     * @param {string} missionId - Mission identifier
     * @param {boolean} success - Mission success status
     * @param {Object} results - Mission results
     */
    async completeMissionMonitoring(missionId, success, results = {}) {
        const completionTime = Date.now();
        const startTime = this._getLatestMetric(`mission.${missionId}.start_time`);
        const totalDuration = startTime ? completionTime - startTime.value : 0;

        // Record mission completion metrics
        this._recordMetric('mission.completed', 1, { 
            missionId, 
            success, 
            duration: totalDuration,
            results 
        });
        this._recordMetric(`mission.${missionId}.duration`, totalDuration);
        this._recordMetric(`mission.${missionId}.success`, success ? 1 : 0);

        // Update global analytics
        if (success) {
            this.analytics.missionSuccess++;
        } else {
            this.analytics.missionFailure++;
            this._recordAlert('ERROR', 
                `Mission ${missionId} failed`, 
                `Results: ${JSON.stringify(results)}`
            );
        }

        // Calculate new average deployment time
        const totalMissions = this.analytics.missionSuccess + this.analytics.missionFailure;
        this.analytics.avgDeploymentTime = ((this.analytics.avgDeploymentTime * (totalMissions - 1)) + totalDuration) / totalMissions;

        // Store mission data to database
        try {
            await this._storeMissionAnalytics(missionId, {
                success,
                duration: totalDuration,
                results,
                timestamp: completionTime
            });
        } catch (error) {
    console.error('❌ Operation failed:', error.message);
    // Recovery mechanism - graceful degradation
    
            this._recordAlert('WARNING', 'Failed to store mission analytics', error.message);
        
}
    }

    /**
     * Perform comprehensive health checks on ESMC components
     * @returns {Object} Health check results
     */
    async performHealthCheck() {
        const healthResults = {
            overall: 'HEALTHY',
            timestamp: new Date().toISOString(),
            checks: {},
            alerts: []
        };

        // Database connectivity check
        try {
            const dbHealth = await this._checkDatabaseHealth();
            healthResults.checks.database = dbHealth;
            if (!dbHealth.healthy) {
                healthResults.overall = 'DEGRADED';
                healthResults.alerts.push({
                    severity: 'ERROR',
                    component: 'database',
                    message: dbHealth.error
                });
            }
        } catch (error) {
    console.error('❌ Operation failed:', error.message);
    // Recovery mechanism - graceful degradation
    
            healthResults.checks.database = { healthy: false, error: error.message 
};
            healthResults.overall = 'CRITICAL';
        }

        // Memory usage check
        const memoryUsage = process.memoryUsage();
        const memoryHealthy = memoryUsage.heapUsed < (memoryUsage.heapTotal * 0.85);
        healthResults.checks.memory = {
            healthy: memoryHealthy,
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            utilization: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
        };

        if (!memoryHealthy) {
            healthResults.overall = 'DEGRADED';
            healthResults.alerts.push({
                severity: 'WARNING',
                component: 'memory',
                message: `High memory utilization: ${healthResults.checks.memory.utilization}%`
            });
        }

        // File system access check
        try {
            await fs.access(path.join(__dirname, '..'));
            healthResults.checks.filesystem = { healthy: true };
        } catch (error) {
    console.error('❌ Operation failed:', error.message);
    // Recovery mechanism - graceful degradation
    
            healthResults.checks.filesystem = { healthy: false, error: error.message 
};
            healthResults.overall = 'CRITICAL';
        }

        // Agent availability check
        try {
            const agentHealth = await this._checkAgentHealth();
            healthResults.checks.agents = agentHealth;
        } catch (error) {
    console.error('❌ Operation failed:', error.message);
    // Recovery mechanism - graceful degradation
    
            healthResults.checks.agents = { healthy: false, error: error.message 
};
            if (healthResults.overall === 'HEALTHY') {
                healthResults.overall = 'DEGRADED';
            }
        }

        this._recordMetric('system.health_check', healthResults.overall);
        return healthResults;
    }

    /**
     * Get current performance dashboard data
     * @returns {Object} Dashboard metrics and analytics
     */
    getDashboard() {
        const uptime = Date.now() - this.startTime;
        const totalMissions = this.analytics.missionSuccess + this.analytics.missionFailure;
        
        return {
            system: {
                status: this.isMonitoring ? 'MONITORING' : 'OFFLINE',
                uptime: uptime,
                uptimeFormatted: this._formatDuration(uptime)
            },
            missions: {
                total: totalMissions,
                successful: this.analytics.missionSuccess,
                failed: this.analytics.missionFailure,
                successRate: totalMissions > 0 ? Math.round((this.analytics.missionSuccess / totalMissions) * 100) : 100,
                avgDeploymentTime: Math.round(this.analytics.avgDeploymentTime),
                avgDeploymentFormatted: this._formatDuration(this.analytics.avgDeploymentTime)
            },
            colonels: Array.from(this.analytics.colonelPerformance.entries()).map(([colonel, stats]) => ({
                colonel,
                deployments: stats.deployments,
                successRate: Math.round(stats.successRate),
                avgExecutionTime: Math.round(stats.avgExecutionTime),
                errors: stats.errors
            })),
            alerts: this.alerts.slice(-10), // Last 10 alerts
            recentMetrics: this._getRecentMetrics(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Initialize metrics collection system
     */
    async _initializeMetricsCollection() {
        // Set up core system metrics
        this._recordMetric('system.startup_time', Date.now());
        this._recordMetric('system.version', '3.1.0');
        this._recordMetric('system.component', 'observability');
        
        // Initialize performance baselines
        const memoryUsage = process.memoryUsage();
        this._recordMetric('system.baseline_memory', memoryUsage.heapUsed);
    }

    /**
     * Initialize health check system
     */
    async _initializeHealthChecks() {
        this.healthChecks.set('database', this._checkDatabaseHealth.bind(this));
        this.healthChecks.set('agents', this._checkAgentHealth.bind(this));
        this.healthChecks.set('filesystem', this._checkFilesystemHealth.bind(this));
    }

    /**
     * Initialize alert system
     */
    async _initializeAlertSystem() {
        this.alerts = [];
        this._recordAlert('INFO', 'Observability system initialized', 'All monitoring systems operational');
    }

    /**
     * Load historical analytics from database
     */
    async _loadHistoricalAnalytics() {
        try {
            const connection = await mysql.createConnection(this.dbConfig);
            
            // Get mission statistics
            const [missionStats] = await connection.execute(`
                SELECT 
                    COUNT(*) as total_missions,
                    SUM(CASE WHEN case_status = 'COMPLETED' THEN 1 ELSE 0 END) as successful_missions,
                    AVG(TIMESTAMPDIFF(MICROSECOND, created_at, updated_at)) as avg_duration
                FROM general_intel 
                WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
            `);

            if (missionStats.length > 0) {
                const stats = missionStats[0];
                this.analytics.missionSuccess = stats.successful_missions || 0;
                this.analytics.missionFailure = (stats.total_missions || 0) - (stats.successful_missions || 0);
                this.analytics.avgDeploymentTime = (stats.avg_duration || 0) / 1000; // Convert to milliseconds
            }

            await connection.end();
        } catch (error) {
    console.error('❌ Operation failed:', error.message);
    // Recovery mechanism - graceful degradation
    
            // Non-critical error - continue with empty analytics
            this._recordAlert('WARNING', 'Could not load historical analytics', error.message);
        
}
    }

    /**
     * Check database health and connectivity
     */
    async _checkDatabaseHealth() {
        try {
            const connection = await mysql.createConnection(this.dbConfig);
            const [result] = await connection.execute('SELECT 1 as health_check');
            await connection.end();
            
            return {
                healthy: true,
                responseTime: Date.now() - Date.now(),
                lastCheck: new Date().toISOString()
            };
        } catch (error) {
    console.error('❌ Operation failed:', error.message);
    // Recovery mechanism - graceful degradation
    
            return {
                healthy: false,
                error: error.message,
                lastCheck: new Date().toISOString()
            
};
        }
    }

    /**
     * Check agent system health
     */
    async _checkAgentHealth() {
        try {
            const agentPath = path.join(__dirname, '..', 'agents', 'functional-code-cleanup-agents.js');
            await fs.access(agentPath);
            
            // Try to require the agents module
            const agents = require(agentPath);
            const availableAgents = Object.keys(agents).length;
            
            return {
                healthy: availableAgents > 0,
                availableAgents,
                agentTypes: Object.keys(agents),
                lastCheck: new Date().toISOString()
            };
        } catch (error) {
    console.error('❌ Operation failed:', error.message);
    // Recovery mechanism - graceful degradation
    
            return {
                healthy: false,
                error: error.message,
                lastCheck: new Date().toISOString()
            
};
        }
    }

    /**
     * Check filesystem health
     */
    async _checkFilesystemHealth() {
        try {
            const testFile = path.join(__dirname, '.health_check');
            await fs.writeFile(testFile, 'health_check');
            await fs.unlink(testFile);
            
            return {
                healthy: true,
                lastCheck: new Date().toISOString()
            };
        } catch (error) {
    console.error('❌ Operation failed:', error.message);
    // Recovery mechanism - graceful degradation
    
            return {
                healthy: false,
                error: error.message,
                lastCheck: new Date().toISOString()
            
};
        }
    }

    /**
     * Record system alert
     */
    _recordAlert(severity, message, details = '') {
        const alert = {
            severity,
            message,
            details,
            timestamp: new Date().toISOString(),
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        this.alerts.push(alert);
        
        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts.splice(0, this.alerts.length - 100);
        }

        // Log critical alerts
        if (severity === 'CRITICAL' || severity === 'ERROR') {
            console.error(`[ESMC ALERT ${severity}] ${message}: ${details}`);
        }

        return alert;
    }

    /**
     * Get latest metric value
     */
    _getLatestMetric(metric) {
        const metricData = this.metrics.get(metric);
        if (!metricData || metricData.length === 0) {
            return null;
        }
        return metricData[metricData.length - 1];
    }

    /**
     * Get recent metrics for dashboard
     */
    _getRecentMetrics() {
        const recentMetrics = {};
        const cutoffTime = Date.now() - (5 * 60 * 1000); // Last 5 minutes

        for (const [metric, data] of this.metrics.entries()) {
            const recentData = data.filter(d => d.timestamp > cutoffTime);
            if (recentData.length > 0) {
                recentMetrics[metric] = {
                    count: recentData.length,
                    latest: recentData[recentData.length - 1].value,
                    average: recentData.reduce((sum, d) => sum + (typeof d.value === 'number' ? d.value : 0), 0) / recentData.length
                };
            }
        }

        return recentMetrics;
    }

    /**
     * Store mission analytics to database
     */
    async _storeMissionAnalytics(missionId, data) {
        const connection = await mysql.createConnection(this.dbConfig);
        
        try {
            await connection.execute(`
                INSERT INTO mission_analytics (mission_id, success, duration_ms, results, timestamp)
                VALUES (?, ?, ?, ?, FROM_UNIXTIME(? / 1000))
            `, [missionId, data.success, data.duration, JSON.stringify(data.results), data.timestamp]);
            
        } finally {
            await connection.end();
        }
    }

    /**
     * Format duration in human-readable format
     */
    _formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
}

module.exports = { ESMCObservabilitySystem };