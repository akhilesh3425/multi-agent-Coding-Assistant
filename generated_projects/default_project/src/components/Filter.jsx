import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Filter = ({ onFilterChange }) => {
    const [filter, setFilter] = useState('all');

    const handleFilterChange = (event) => {
        const selectedFilter = event.target.value;
        setFilter(selectedFilter);
        onFilterChange(selectedFilter);
    };

    return (
        <div>
            <label>
                <input 
                    type="radio" 
                    value="all" 
                    checked={filter === 'all'} 
                    onChange={handleFilterChange} 
                />
                All
            </label>
            <label>
                <input 
                    type="radio" 
                    value="completed" 
                    checked={filter === 'completed'} 
                    onChange={handleFilterChange} 
                />
                Completed
            </label>
            <label>
                <input 
                    type="radio" 
                    value="pending" 
                    checked={filter === 'pending'} 
                    onChange={handleFilterChange} 
                />
                Pending
            </label>
        </div>
    );
};

Filter.propTypes = {
    onFilterChange: PropTypes.func.isRequired,
};

export default Filter;