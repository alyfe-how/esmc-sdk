#!/usr/bin/env node
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

/**
 * ESMC 3.69 - AEGIS PRECEDENT REGISTRAR CLI
 *
 * CLI wrapper for solution precedent registration
 * Enables command-line and subprocess invocation
 *
 * Usage:
 *   node aegis-precedent-registrar-cli.js register <json_data>
 *   node aegis-precedent-registrar-cli.js detect-confirmation "<user_message>"
 *   node aegis-precedent-registrar-cli.js stats
 *   node aegis-precedent-registrar-cli.js increment-reuse <session_id>
 *
 * @module AEGIS_PRECEDENT_REGISTRAR_CLI
 * @version 3.69.0
 */

const AegisPrecedentRegistrar = require('./aegis-precedent-registrar.js');

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const registrar = new AegisPrecedentRegistrar();
    await registrar.initialize();

    try {
        switch (command) {
            case 'register': {
                // Register precedent from JSON data
                const jsonData = args[1];
                if (!jsonData) {
                    console.error('❌ ERROR: Missing precedent data JSON');
                    console.error('Usage: node aegis-precedent-registrar-cli.js register \'<json_data>\'');
                    process.exit(1);
                }

                let precedentData;
                try {
                    precedentData = JSON.parse(jsonData);
                } catch (e) {
                    console.error('❌ ERROR: Invalid JSON data');
                    process.exit(1);
                }

                const result = await registrar.registerPrecedent(precedentData);
                console.log(JSON.stringify(result, null, 2));
                process.exit(result.success ? 0 : 1);
                break;
            }

            case 'detect-confirmation': {
                // Detect user confirmation from message
                const userMessage = args[1];
                if (!userMessage) {
                    console.error('❌ ERROR: Missing user message');
                    console.error('Usage: node aegis-precedent-registrar-cli.js detect-confirmation "<message>"');
                    process.exit(1);
                }

                const detection = registrar.detectConfirmation(userMessage);
                console.log(JSON.stringify(detection, null, 2));
                process.exit(0);
                break;
            }

            case 'stats': {
                // Get registry statistics
                const stats = registrar.getStats();
                console.log(JSON.stringify(stats, null, 2));
                process.exit(0);
                break;
            }

            case 'increment-reuse': {
                // Increment reuse counter for precedent
                const sessionId = args[1];
                if (!sessionId) {
                    console.error('❌ ERROR: Missing session ID');
                    console.error('Usage: node aegis-precedent-registrar-cli.js increment-reuse <session_id>');
                    process.exit(1);
                }

                await registrar.incrementReuse(sessionId);
                console.log(JSON.stringify({ success: true, session_id: sessionId }, null, 2));
                process.exit(0);
                break;
            }

            default: {
                console.log('AEGIS PRECEDENT REGISTRAR CLI v3.69.0');
                console.log('');
                console.log('Commands:');
                console.log('  register <json_data>          Register solution precedent');
                console.log('  detect-confirmation <message>  Detect user confirmation keywords');
                console.log('  stats                         Show registry statistics');
                console.log('  increment-reuse <session_id>  Increment reuse counter');
                console.log('');
                console.log('Example:');
                console.log('  node aegis-precedent-registrar-cli.js register \'{"problem": {...}, "solution": {...}}\'');
                console.log('  node aegis-precedent-registrar-cli.js detect-confirmation "validation confirmed, works perfectly"');
                process.exit(0);
            }
        }
    } catch (error) {
        console.error('❌ CLI ERROR:', error.message);
        process.exit(1);
    }
}

main();
