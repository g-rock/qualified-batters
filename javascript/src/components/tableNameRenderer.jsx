import React from 'react';
// I think saving all these images to the public folder increases browswer performance.
// My internet was taking forever to load the images from source everytime i refreshed
export default (params) => {
    const playerId = params.data.playerId;
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
                src={`/images/${playerId}.png`} 
                alt={params.data.playerFullName} 
                style={{ width: 20, height: 20, marginRight: 10 }}
            />
            {params.data.playerFullName}
        </div>
    );
};
