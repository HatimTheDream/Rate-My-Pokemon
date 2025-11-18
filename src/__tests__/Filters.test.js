import { jsx as _jsx } from "react/jsx-runtime";
/// <reference types="vitest" />
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Filters } from '../components/Filters';
import { describe, it, expect } from 'vitest';
describe('Filters', () => {
    it('renders Filters and shows Sort select', () => {
        const mockMon = {
            id: 25,
            name: 'Pikachu',
            dex: 25,
            generation: 1,
            region: 'Kanto',
            types: ['ELECTRIC'],
            flags: {},
            pokedex: 'Test entry',
            evoChain: [25],
            seedAvg: 8.0,
            seedCount: 100,
        };
        const props = {
            typeSet: new Set(),
            toggleType: (_t) => { },
            genSet: new Set(),
            toggleGen: (_g) => { },
            catSet: new Set(),
            toggleCat: (_c) => { },
            sortBy: 'dex',
            setSortBy: (_s) => { },
            mons: [mockMon],
            itemsCount: 1,
            dense: false,
            setDense: (_b) => { },
        };
        render(_jsx(Filters, { ...props }));
        const sortLabel = screen.getByText(/Sort/i);
        expect(sortLabel).toBeInTheDocument();
        const coolnessBtn = screen.getByRole('button', { name: /Coolness/i });
        expect(coolnessBtn).toBeInTheDocument();
    });
});
