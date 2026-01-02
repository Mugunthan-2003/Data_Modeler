import { useState } from 'react';

export const useSuggestions = () => {
    const [showSuggestDialog, setShowSuggestDialog] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLevel2, setSuggestionsLevel2] = useState([]);

    const generateSuggestions = async (nodes, entitySource) => {
        try {
            const sourceEntities = entitySource?.entities || {};
            const sourceName = entitySource?.metadata?.name || 'Data Product';

            if (!entitySource || Object.keys(sourceEntities).length === 0) {
                alert('No data product entities available for suggestions.');
                return;
            }

            const canvasTables = nodes.map(node => ({
                name: node.data.tableName,
                type: node.data.tableType,
                fields: node.data.fields.map(f => f.name),
                fullKey: `${node.data.tableType}_${node.data.tableName}`
            }));

            if (canvasTables.length === 0) {
                alert('Please add some tables to the canvas first!');
                return;
            }

            const canvasEntityKeys = new Set(canvasTables.map(t => t.fullKey));

            const foundSuggestions = [];
            for (const entityKey in sourceEntities) {
                if (canvasEntityKeys.has(entityKey)) continue;
                if (!entityKey.startsWith('CTE_') && !entityKey.startsWith('VIEW_')) continue;

                const entity = sourceEntities[entityKey];
                const entityFields = Object.keys(entity.fields || {});
                if (entityFields.length === 0) continue;

                const referencedEntities = new Set();
                const missingReferencedEntities = new Set();
                const dependencyMap = {}; // Map of dependent entities to their connection details
                
                entityFields.forEach(fieldName => {
                    const fieldData = entity.fields[fieldName];
                    
                    const processRefs = (refs, isCalculation = false) => {
                        if (refs && Array.isArray(refs)) {
                            refs.forEach(refPath => {
                                const [refEntity, refField] = refPath.split('.');
                                if (refEntity && refField) {
                                    const isOnCanvas = canvasTables.some(t => 
                                        t.fullKey === refEntity || `${t.type}_${t.name}` === refEntity
                                    );
                                    
                                    // Store dependency details for connection creation
                                    if (!dependencyMap[refEntity]) {
                                        dependencyMap[refEntity] = [];
                                    }
                                    dependencyMap[refEntity].push({
                                        targetField: fieldName,
                                        sourceField: refField,
                                        connectionType: isCalculation ? 'calculation' : 'ref',
                                        calculation: isCalculation ? (fieldData.calculation?.expression || '') : null
                                    });
                                    
                                    if (isOnCanvas) {
                                        referencedEntities.add(refEntity);
                                    } else {
                                        missingReferencedEntities.add(refEntity);
                                    }
                                }
                            });
                        }
                    };

                    processRefs(fieldData.ref, false);
                    if (fieldData.calculation) {
                        processRefs(fieldData.calculation.ref, true);
                    }
                });
                
                if (referencedEntities.size > 0) {
                    const totalReferencedEntities = referencedEntities.size + missingReferencedEntities.size;
                    const coveragePercent = Math.round((referencedEntities.size / totalReferencedEntities) * 100);
                    
                    const missingEntitiesWithTypes = Array.from(missingReferencedEntities).map(fullKey => {
                        const type = fullKey.match(/^(BASE|CTE|VIEW)_/) ? fullKey.match(/^(BASE|CTE|VIEW)_/)[1] : 'BASE';
                        const name = fullKey.replace(/^(BASE_|CTE_|VIEW_)/, '');
                        return { fullKey, name, type };
                    });
                    
                    foundSuggestions.push({
                        entityName: entityKey,
                        alias: entity.alias || entityKey,
                        entityType: entityKey.startsWith('CTE_') ? 'CTE' : 'VIEW',
                        sourceFile: sourceName,
                        matchingTables: Array.from(referencedEntities).map(e => e.replace(/^(BASE_|CTE_|VIEW_)/, '')),
                        coveragePercent,
                        missingEntities: missingEntitiesWithTypes,
                        totalFields: entityFields.length,
                        referencedEntitiesCount: totalReferencedEntities,
                        dependencyMap, // Store the complete dependency mapping with connection details
                        entityData: entity // Store full entity data for later use
                    });
                }
            }

            const uniqueSuggestions = [];
            const seenEntities = new Set();
            
            for (const suggestion of foundSuggestions) {
                if (!seenEntities.has(suggestion.entityName)) {
                    seenEntities.add(suggestion.entityName);
                    uniqueSuggestions.push(suggestion);
                }
            }

            uniqueSuggestions.sort((a, b) => b.coveragePercent - a.coveragePercent);

            // Calculate level 2 suggestions
            const level1EntityKeys = new Set(uniqueSuggestions.map(s => s.entityName));
            const potentialSources = new Set([...canvasEntityKeys, ...level1EntityKeys]);
            const foundSuggestionsLevel2 = [];

            for (const entityKey in sourceEntities) {
                if (level1EntityKeys.has(entityKey) || canvasEntityKeys.has(entityKey)) continue;
                if (!entityKey.startsWith('CTE_') && !entityKey.startsWith('VIEW_')) continue;

                const entity = sourceEntities[entityKey];
                const entityFields = Object.keys(entity.fields || {});
                if (entityFields.length === 0) continue;

                const referencedEntities = new Set();
                const missingReferencedEntities = new Set();
                const dependencyMap = {}; // Map for level 2 as well
                
                entityFields.forEach(fieldName => {
                    const fieldData = entity.fields[fieldName];
                    
                    const processRefs = (refs, isCalculation = false) => {
                        if (refs && Array.isArray(refs)) {
                            refs.forEach(refPath => {
                                const [refEntity, refField] = refPath.split('.');
                                if (refEntity && refField) {
                                    // Store dependency details
                                    if (!dependencyMap[refEntity]) {
                                        dependencyMap[refEntity] = [];
                                    }
                                    dependencyMap[refEntity].push({
                                        targetField: fieldName,
                                        sourceField: refField,
                                        connectionType: isCalculation ? 'calculation' : 'ref',
                                        calculation: isCalculation ? (fieldData.calculation?.expression || '') : null
                                    });
                                    
                                    if (potentialSources.has(refEntity)) {
                                        referencedEntities.add(refEntity);
                                    } else {
                                        missingReferencedEntities.add(refEntity);
                                    }
                                }
                            });
                        }
                    };

                    processRefs(fieldData.ref, false);
                    if (fieldData.calculation) {
                        processRefs(fieldData.calculation.ref, true);
                    }
                });
                
                const referencesLevel1 = Array.from(referencedEntities).some(ref => level1EntityKeys.has(ref));
                
                if (referencedEntities.size > 0 && referencesLevel1) {
                    const totalReferencedEntities = referencedEntities.size + missingReferencedEntities.size;
                    const coveragePercent = Math.round((referencedEntities.size / totalReferencedEntities) * 100);
                    
                    const missingEntitiesWithTypes = Array.from(missingReferencedEntities).map(fullKey => {
                        const type = fullKey.match(/^(BASE|CTE|VIEW)_/) ? fullKey.match(/^(BASE|CTE|VIEW)_/)[1] : 'BASE';
                        const name = fullKey.replace(/^(BASE_|CTE_|VIEW_)/, '');
                        return { fullKey, name, type };
                    });
                    
                    foundSuggestionsLevel2.push({
                        entityName: entityKey,
                        alias: entity.alias || entityKey,
                        entityType: entityKey.startsWith('CTE_') ? 'CTE' : 'VIEW',
                        sourceFile: sourceName,
                        matchingTables: Array.from(referencedEntities).map(e => e.replace(/^(BASE_|CTE_|VIEW_)/, '')),
                        coveragePercent,
                        missingEntities: missingEntitiesWithTypes,
                        totalFields: entityFields.length,
                        referencedEntitiesCount: totalReferencedEntities,
                        level: 2,
                        dependencyMap, // Store dependency mapping
                        entityData: entity // Store full entity data
                    });
                }
            }
            
            const uniqueSuggestionsLevel2 = [];
            const seenEntitiesLevel2 = new Set();
            
            for (const suggestion of foundSuggestionsLevel2) {
                if (!seenEntitiesLevel2.has(suggestion.entityName)) {
                    seenEntitiesLevel2.add(suggestion.entityName);
                    uniqueSuggestionsLevel2.push(suggestion);
                }
            }
            
            uniqueSuggestionsLevel2.sort((a, b) => b.coveragePercent - a.coveragePercent);

            setSuggestions(uniqueSuggestions);
            setSuggestionsLevel2(uniqueSuggestionsLevel2);
            setShowSuggestDialog(true);
        } catch (error) {
            console.error('Error generating suggestions:', error);
            alert('Error generating suggestions: ' + error.message);
        }
    };

    return {
        showSuggestDialog,
        suggestions,
        suggestionsLevel2,
        generateSuggestions,
        setShowSuggestDialog
    };
};
