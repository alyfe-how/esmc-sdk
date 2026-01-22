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
/** ESMC 3.1 DASHBOARD SYSTEM | 2025-09-04 | v3.1.0 | PROD | TIER 2
 *  Purpose: Interactive CLI dashboard for real-time ESMC operations monitoring
 *  Features: Real-time metrics | Colonel status tracking | Mission monitoring | Command-line interface
 */

const { ESMCObservabilitySystem } = require('./83e2549f');
const readline = require('readline');

/**
 * Interactive Real-Time Dashboard for ESMC Operations
 * Provides command-line interface for monitoring system performance
 */
class ESMCDashboard {
    constructor() {
        this.observability = new ESMCObservabilitySystem();
        this.isRunning = false;
        this.refreshInterval = null;
        this.refreshRate = 2000; // 2 seconds
        this.currentView = 'overview';
        this.views = ['overview', 'colonels', 'missions', 'health', 'alerts'];
    }

    /**
     * Start the interactive dashboard
     */
    async start() {
        console.log('🎖️ Initializing ESMC Real-Time Dashboard...');
        
        try {
            await this.observability.initialize();
            this.isRunning = true;
            
            // Set up keyboard input handling
            this._setupKeyboardHandling();
            
            // Start refresh loop
            this.refreshInterval = setInterval(() => {
                this._refreshDisplay();
            }, this.refreshRate);

            // Initial display
            this._refreshDisplay();
            this._showControls();
            
        } catch (error) {
            console.error('❌ Failed to initialize dashboard:', error.message);
            process.exit(1);
        }
    }

    /**
     * Stop the dashboard
     */
    stop() {
        this.isRunning = false;
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        console.log('\n🎖️ ESMC Dashboard stopped');
        process.exit(0);
    }

    /**
     * Refresh the current display
     */
    async _refreshDisplay() {
        if (!this.isRunning) return;

        // Clear screen
        console.clear();
        
        try {
            const dashboard = this.observability.getDashboard();
            
            switch (this.currentView) {
                case 'overview':
                    this._displayOverview(dashboard);
                    break;
                case 'colonels':
                    this._displayColonels(dashboard);
                    break;
                case 'missions':
                    this._displayMissions(dashboard);
                    break;
                case 'health':
                    await this._displayHealth();
                    break;
                case 'alerts':
                    this._displayAlerts(dashboard);
                    break;
            }
            
        } catch (error) {
            console.error('❌ Dashboard refresh error:', error.message);
        }
    }

    /**
     * Display system overview
     */
    _displayOverview(dashboard) {
        const title = '🎖️ ESMC 3.1 - COMMAND OVERVIEW';
        const border = '═'.repeat(title.length);
        
        console.log(border);
        console.log(title);
        console.log(border);
        console.log(`📅 ${new Date().toLocaleString()}`);
        console.log(`⏱️  System Uptime: ${dashboard.system.uptimeFormatted}`);
        console.log(`🚦 Status: ${this._colorStatus(dashboard.system.status)}`);
        console.log('');
        
        // Mission Statistics
        console.log('📊 MISSION STATISTICS');
        console.log('─'.repeat(25));
        console.log(`Total Missions: ${dashboard.missions.total}`);
        console.log(`✅ Successful: ${dashboard.missions.successful} (${dashboard.missions.successRate}%)`);
        console.log(`❌ Failed: ${dashboard.missions.failed}`);
        console.log(`⚡ Avg Duration: ${dashboard.missions.avgDeploymentFormatted}`);
        console.log('');
        
        // Colonel Performance Summary
        console.log('🎖️ COLONEL STATUS SUMMARY');
        console.log('─'.repeat(30));
        if (dashboard.colonels.length === 0) {
            console.log('⏳ No colonel deployments yet');
        } else {
            dashboard.colonels.slice(0, 5).forEach(colonel => {
                const status = colonel.successRate >= 95 ? '🟢' : colonel.successRate >= 85 ? '🟡' : '🔴';
                console.log(`${status} ${colonel.colonel}: ${colonel.successRate}% success (${colonel.deployments} deployments)`);
            });
        }
        console.log('');
        
        // Recent Alerts
        if (dashboard.alerts.length > 0) {
            console.log('🚨 RECENT ALERTS');
            console.log('─'.repeat(20));
            dashboard.alerts.slice(-3).forEach(alert => {
                const severity = this._colorSeverity(alert.severity);
                const time = new Date(alert.timestamp).toLocaleTimeString();
                console.log(`${severity} ${time}: ${alert.message}`);
            });
        }
    }

    /**
     * Display colonel performance details
     */
    _displayColonels(dashboard) {
        const title = '🎖️ COLONEL PERFORMANCE DASHBOARD';
        const border = '═'.repeat(title.length);
        
        console.log(border);
        console.log(title);
        console.log(border);
        console.log(`📅 ${new Date().toLocaleString()}`);
        console.log('');
        
        if (dashboard.colonels.length === 0) {
            console.log('⏳ No colonel deployment data available yet');
            console.log('   Deploy ESMC missions to see performance metrics');
            return;
        }
        
        // Header
        console.log('┌────────────┬─────────────┬─────────────┬─────────────┬────────┐');
        console.log('│   COLONEL  │ DEPLOYMENTS │ SUCCESS (%) │ AVG TIME(ms)│ ERRORS │');
        console.log('├────────────┼─────────────┼─────────────┼─────────────┼────────┤');
        
        dashboard.colonels.forEach(colonel => {
            const status = colonel.successRate >= 95 ? '🟢' : colonel.successRate >= 85 ? '🟡' : '🔴';
            console.log(`│ ${status} ${colonel.colonel.padEnd(8)} │     ${colonel.deployments.toString().padStart(7)} │     ${colonel.successRate.toString().padStart(7)} │     ${colonel.avgExecutionTime.toString().padStart(7)} │  ${colonel.errors.toString().padStart(4)} │`);
        });
        
        console.log('└────────────┴─────────────┴─────────────┴─────────────┴────────┘');
        console.log('');
        
        // Performance Analysis
        const topPerformer = dashboard.colonels.reduce((prev, current) => 
            (prev.successRate > current.successRate) ? prev : current
        );
        const avgSuccessRate = dashboard.colonels.reduce((sum, c) => sum + c.successRate, 0) / dashboard.colonels.length;
        
        console.log('📈 PERFORMANCE ANALYSIS');
        console.log('─'.repeat(25));
        console.log(`🏆 Top Performer: COLONEL ${topPerformer.colonel} (${topPerformer.successRate}% success)`);
        console.log(`📊 Average Success Rate: ${avgSuccessRate.toFixed(1)}%`);
        console.log(`🎯 Target Success Rate: 95%`);
        
        const underperformers = dashboard.colonels.filter(c => c.successRate < 85);
        if (underperformers.length > 0) {
            console.log('⚠️  Colonels needing attention:');
            underperformers.forEach(colonel => {
                console.log(`   - COLONEL ${colonel.colonel}: ${colonel.successRate}% success`);
            });
        }
    }

    /**
     * Display mission tracking details
     */
    _displayMissions(dashboard) {
        const title = '🎯 MISSION TRACKING DASHBOARD';
        const border = '═'.repeat(title.length);
        
        console.log(border);
        console.log(title);
        console.log(border);
        console.log(`📅 ${new Date().toLocaleString()}`);
        console.log('');
        
        // Mission Summary
        console.log('📊 MISSION SUMMARY');
        console.log('─'.repeat(20));
        console.log(`Total Missions: ${dashboard.missions.total}`);
        console.log(`Success Rate: ${dashboard.missions.successRate}% (${dashboard.missions.successful}/${dashboard.missions.total})`);
        console.log(`Average Duration: ${dashboard.missions.avgDeploymentFormatted}`);
        console.log('');
        
        // Success Rate Visualization
        const successBar = '█'.repeat(Math.floor(dashboard.missions.successRate / 5));
        const failureBar = '░'.repeat(20 - Math.floor(dashboard.missions.successRate / 5));
        console.log('📈 SUCCESS RATE VISUALIZATION');
        console.log('─'.repeat(30));
        console.log(`Success: ${successBar}${failureBar} ${dashboard.missions.successRate}%`);
        console.log('         0%    25%   50%   75%   100%');
        console.log('');
        
        // Mission Performance Metrics
        console.log('⚡ PERFORMANCE METRICS');
        console.log('─'.repeat(25));
        const avgDuration = dashboard.missions.avgDeploymentTime;
        let performanceRating = 'EXCELLENT';
        if (avgDuration > 5000) performanceRating = 'NEEDS IMPROVEMENT';
        else if (avgDuration > 2000) performanceRating = 'GOOD';
        else if (avgDuration > 1000) performanceRating = 'VERY GOOD';
        
        console.log(`Performance Rating: ${this._colorPerformance(performanceRating)}`);
        console.log(`Average Response Time: ${dashboard.missions.avgDeploymentFormatted}`);
        console.log(`Target Response Time: <1000ms`);
        console.log('');
        
        // Recent Mission Trends
        console.log('📈 RECENT TRENDS');
        console.log('─'.repeat(20));
        if (dashboard.missions.total < 5) {
            console.log('⏳ Insufficient data for trend analysis');
            console.log('   Complete more missions to see trends');
        } else {
            console.log('✅ Mission completion tracking active');
            console.log(`📊 Success rate: ${dashboard.missions.successRate >= 90 ? 'Excellent' : dashboard.missions.successRate >= 75 ? 'Good' : 'Needs Improvement'}`);
        }
    }

    /**
     * Display system health status
     */
    async _displayHealth() {
        const title = '🏥 SYSTEM HEALTH DASHBOARD';
        const border = '═'.repeat(title.length);
        
        console.log(border);
        console.log(title);
        console.log(border);
        console.log(`📅 ${new Date().toLocaleString()}`);
        console.log('');
        
        try {
            const health = await this.observability.performHealthCheck();
            
            // Overall Status
            console.log('🚦 OVERALL SYSTEM STATUS');
            console.log('─'.repeat(30));
            console.log(`Status: ${this._colorStatus(health.overall)}`);
            console.log(`Last Check: ${new Date(health.timestamp).toLocaleTimeString()}`);
            console.log('');
            
            // Component Health Details
            console.log('🔍 COMPONENT HEALTH DETAILS');
            console.log('─'.repeat(35));
            
            // Database Health
            if (health.checks.database) {
                const dbStatus = health.checks.database.healthy ? '🟢 HEALTHY' : '🔴 UNHEALTHY';
                console.log(`Database: ${dbStatus}`);
                if (!health.checks.database.healthy) {
                    console.log(`  Error: ${health.checks.database.error}`);
                }
            }
            
            // Memory Health
            if (health.checks.memory) {
                const memStatus = health.checks.memory.healthy ? '🟢 HEALTHY' : '🟡 WARNING';
                console.log(`Memory: ${memStatus}`);
                console.log(`  Used: ${health.checks.memory.heapUsed}MB / ${health.checks.memory.heapTotal}MB (${health.checks.memory.utilization}%)`);
            }
            
            // Filesystem Health
            if (health.checks.filesystem) {
                const fsStatus = health.checks.filesystem.healthy ? '🟢 HEALTHY' : '🔴 UNHEALTHY';
                console.log(`Filesystem: ${fsStatus}`);
                if (!health.checks.filesystem.healthy) {
                    console.log(`  Error: ${health.checks.filesystem.error}`);
                }
            }
            
            // Agent Health
            if (health.checks.agents) {
                const agentStatus = health.checks.agents.healthy ? '🟢 HEALTHY' : '🟡 WARNING';
                console.log(`Agents: ${agentStatus}`);
                if (health.checks.agents.healthy) {
                    console.log(`  Available Agents: ${health.checks.agents.availableAgents}`);
                    console.log(`  Agent Types: ${health.checks.agents.agentTypes.join(', ')}`);
                } else {
                    console.log(`  Error: ${health.checks.agents.error}`);
                }
            }
            
            console.log('');
            
            // Health Alerts
            if (health.alerts.length > 0) {
                console.log('🚨 HEALTH ALERTS');
                console.log('─'.repeat(20));
                health.alerts.forEach(alert => {
                    const severity = this._colorSeverity(alert.severity);
                    console.log(`${severity} ${alert.component.toUpperCase()}: ${alert.message}`);
                });
            } else {
                console.log('✅ No health alerts - all systems operating normally');
            }
            
        } catch (error) {
    console.error('❌ Operation failed:', error.message);
    // Recovery mechanism - graceful degradation
    
            console.log('❌ Health check failed:', error.message);
        
}
    }

    /**
     * Display recent alerts
     */
    _displayAlerts(dashboard) {
        const title = '🚨 SYSTEM ALERTS DASHBOARD';
        const border = '═'.repeat(title.length);
        
        console.log(border);
        console.log(title);
        console.log(border);
        console.log(`📅 ${new Date().toLocaleString()}`);
        console.log('');
        
        if (dashboard.alerts.length === 0) {
            console.log('✅ No alerts - system operating normally');
            console.log('');
            console.log('🎯 Alert Types Monitored:');
            console.log('  • Mission failures');
            console.log('  • Performance degradation');
            console.log('  • Database connectivity issues');
            console.log('  • Memory usage warnings');
            console.log('  • Agent system errors');
            return;
        }
        
        // Alert Summary
        const criticalCount = dashboard.alerts.filter(a => a.severity === 'CRITICAL').length;
        const errorCount = dashboard.alerts.filter(a => a.severity === 'ERROR').length;
        const warningCount = dashboard.alerts.filter(a => a.severity === 'WARNING').length;
        const infoCount = dashboard.alerts.filter(a => a.severity === 'INFO').length;
        
        console.log('📊 ALERT SUMMARY');
        console.log('─'.repeat(20));
        if (criticalCount > 0) console.log(`🔴 Critical: ${criticalCount}`);
        if (errorCount > 0) console.log(`🟠 Errors: ${errorCount}`);
        if (warningCount > 0) console.log(`🟡 Warnings: ${warningCount}`);
        console.log(`🔵 Info: ${infoCount}`);
        console.log('');
        
        // Recent Alerts List
        console.log('📋 RECENT ALERTS');
        console.log('─'.repeat(20));
        dashboard.alerts.slice(-10).reverse().forEach((alert, index) => {
            const time = new Date(alert.timestamp).toLocaleString();
            const severity = this._colorSeverity(alert.severity);
            console.log(`${severity} [${time}] ${alert.message}`);
            if (alert.details) {
                console.log(`   Details: ${alert.details}`);
            }
            if (index < 9) console.log(''); // Add spacing except for last item
        });
    }

    /**
     * Set up keyboard input handling
     */
    _setupKeyboardHandling() {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        
        process.stdin.on('data', (key) => {
            // Handle key presses
            switch (key) {
                case '\u0003': // Ctrl+C
                case 'q':
                case 'Q':
                    this.stop();
                    break;
                case '1':
                    this.currentView = 'overview';
                    this._refreshDisplay();
                    break;
                case '2':
                    this.currentView = 'colonels';
                    this._refreshDisplay();
                    break;
                case '3':
                    this.currentView = 'missions';
                    this._refreshDisplay();
                    break;
                case '4':
                    this.currentView = 'health';
                    this._refreshDisplay();
                    break;
                case '5':
                    this.currentView = 'alerts';
                    this._refreshDisplay();
                    break;
                case 'r':
                case 'R':
                    this._refreshDisplay();
                    break;
                case '+':
                    this.refreshRate = Math.max(500, this.refreshRate - 500);
                    console.log(`\n⚡ Refresh rate increased to ${this.refreshRate}ms`);
                    setTimeout(() => this._refreshDisplay(), 1000);
                    break;
                case '-':
                    this.refreshRate = Math.min(10000, this.refreshRate + 500);
                    console.log(`\n🐌 Refresh rate decreased to ${this.refreshRate}ms`);
                    setTimeout(() => this._refreshDisplay(), 1000);
                    break;
            }
        });
    }

    /**
     * Show control instructions
     */
    _showControls() {
        setTimeout(() => {
            console.log('\n' + '═'.repeat(60));
            console.log('🎮 DASHBOARD CONTROLS');
            console.log('─'.repeat(60));
            console.log('1-5: Switch views | R: Refresh | +/-: Speed | Q: Quit');
            console.log('Views: [1]Overview [2]Colonels [3]Missions [4]Health [5]Alerts');
        }, 1000);
    }

    /**
     * Color status text
     */
    _colorStatus(status) {
        switch (status) {
            case 'MONITORING':
            case 'OPERATIONAL':
            case 'HEALTHY':
                return `🟢 ${status}`;
            case 'DEGRADED':
            case 'WARNING':
                return `🟡 ${status}`;
            case 'CRITICAL':
            case 'OFFLINE':
                return `🔴 ${status}`;
            default:
                return `⚪ ${status}`;
        }
    }

    /**
     * Color severity text
     */
    _colorSeverity(severity) {
        switch (severity) {
            case 'CRITICAL':
                return '🔴';
            case 'ERROR':
                return '🟠';
            case 'WARNING':
                return '🟡';
            case 'INFO':
                return '🔵';
            default:
                return '⚪';
        }
    }

    /**
     * Color performance rating
     */
    _colorPerformance(rating) {
        switch (rating) {
            case 'EXCELLENT':
                return '🟢 EXCELLENT';
            case 'VERY GOOD':
                return '🟢 VERY GOOD';
            case 'GOOD':
                return '🟡 GOOD';
            case 'NEEDS IMPROVEMENT':
                return '🟠 NEEDS IMPROVEMENT';
            default:
                return `⚪ ${rating}`;
        }
    }
}

// Allow direct execution
if (require.main === module) {
    const dashboard = new ESMCDashboard();
    dashboard.start().catch(console.error);
}

module.exports = { ESMCDashboard };