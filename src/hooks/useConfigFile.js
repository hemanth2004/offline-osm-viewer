import { useState, useCallback } from 'react';
import TOML from '@iarna/toml';

export const useConfigFile = () => {
    const [config, setConfig] = useState(null);

    // Load config
    const loadConfig = useCallback(async () => {
        try {
            const response = await fetch('./config.toml');
            const data = await response.text();
            const parsedConfig = TOML.parse(data);
            setConfig(parsedConfig);
            return parsedConfig;
        } catch (error) {
            console.error('Error loading config:', error);
            return null;
        }
    }, []);

    // Write config
    const writeConfig = useCallback(async (newConfig) => {
        try {
            const tomlString = TOML.stringify(newConfig);
            const response = await fetch('./config.toml', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/toml',
                },
                body: tomlString
            });

            if (!response.ok) {
                throw new Error('Failed to write config file');
            }

            setConfig(newConfig);
            return true;
        } catch (error) {
            console.error('Error writing config:', error);
            return false;
        }
    }, []);

    // Update specific config section
    const updateConfig = useCallback(async (updater) => {
        if (!config) return false;

        const newConfig = updater(config);
        return await writeConfig(newConfig);
    }, [config, writeConfig]);

    return {
        config,
        loadConfig,
        writeConfig,
        updateConfig
    };
}; 