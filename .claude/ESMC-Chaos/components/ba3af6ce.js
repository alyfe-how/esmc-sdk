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
 * ESMC 3.69 - AEGIS ERROR REGISTRAR CLI
 *
 * CLI wrapper for error signature registration
 * Enables command-line and subprocess invocation
 *
 * Usage:
 *   node aegis-error-registrar-cli.js register <json_data>
 *   node aegis-error-registrar-cli.js stats
 *
 * @module AEGIS_ERROR_REGISTRAR_CLI
 * @version 3.69.0
 */

const AegisErrorRegistrar = require('./aegis-error-registrar.js');

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const registrar = new AegisErrorRegistrar();
    await registrar.initialize();

    try {
        switch (command) {
            case 'register': {
                // Register error from JSON data
                const jsonData = args[1];
                if (!jsonData) {
                    console.error('❌ ERROR: Missing error data JSON');
                    console.error('Usage: node aegis-error-registrar-cli.js register \'<json_data>\'');
                    process.exit(1);
                }

                let errorData;
                try {
                    errorData = JSON.parse(jsonData);
                } catch (e) {
                    console.error('❌ ERROR: Invalid JSON data');
                    process.exit(1);
                }

                const result = await registrar.registerError(errorData);
                console.log(JSON.stringify(result, null, 2));
                process.exit(result.success ? 0 : 1);
                break;
            }

            case 'stats': {
                // Get registry statistics
                const stats = registrar.getStats();
                console.log(JSON.stringify(stats, null, 2));
                process.exit(0);
                break;
            }

            default: {
                console.log('AEGIS ERROR REGISTRAR CLI v3.69.0');
                console.log('');
                console.log('Commands:');
                console.log('  register <json_data>  Register error signature from PHC halt');
                console.log('  stats                 Show registry statistics');
                console.log('');
                console.log('Example:');
                console.log('  node aegis-error-registrar-cli.js register \'{"proposal": {...}, "phc_decision": {...}}\'');
                process.exit(0);
            }
        }
    } catch (error) {
        console.error('❌ CLI ERROR:', error.message);
        process.exit(1);
    }
}

main();
