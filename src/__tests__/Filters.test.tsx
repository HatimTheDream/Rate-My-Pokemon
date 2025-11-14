/// <reference types="vitest" />
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Filters } from '../components/Filters';
import type { Mon } from '../lib/pokemon';
import React from 'react';
import { describe, it, expect } from 'vitest';

describe('Filters', () => {
  it('renders Filters and shows Sort select', () => {
    const mockMon: Mon = {
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
      typeSet: new Set<string>(),
      toggleType: (_t: string) => {},
      genSet: new Set<string>(),
      toggleGen: (_g: string) => {},
      catSet: new Set<string>(),
      toggleCat: (_c: string) => {},
      sortBy: 'dex',
      setSortBy: (_s: string) => {},
      mons: [mockMon],
      itemsCount: 1,
      dense: false,
      setDense: (_b: boolean) => {},
    };

    render(<Filters {...props} />);
    const sortLabel = screen.getByText(/Sort/i);
    expect(sortLabel).toBeInTheDocument();
    const coolnessBtn = screen.getByRole('button', { name: /Coolness/i });
    expect(coolnessBtn).toBeInTheDocument();
  });
});

