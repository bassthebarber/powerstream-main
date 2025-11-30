import React from 'react';

export default function RoyaltySplitForm() {
  return (
    <div className="royalty-split">
      <h2>💰 Royalty Split</h2>
      <form>
        <input type="text" placeholder="Collaborator" />
        <input type="number" placeholder="% Split" />
        <button>Add Split</button>
      </form>
    </div>
  );
}
