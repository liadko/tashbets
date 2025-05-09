import './EnemyGrid.css'


// export default function EnemyGrid({ enemyState }) {
//     // ----------- state -----------


//     // ----------- Effects -----------


//     // ----------- Render Utilities -----------

//     function getCellClass(row, col) {
//         let classes = "cell "

        

//         return classes
//     }

//     // ----------- Render -----------
//     return (
//         <>
//             <div className="grid-wrapper">
//                 <div className="grid"
//                     style={{ "--grid-rows": 5 }}>
//                     {enemyState.grid.map((rowData, rowId) =>
//                         rowData.map((cell, colId) =>
//                             <div key={`${rowId}-${colId}`}
//                                 className={getCellClass(rowId, colId)}>
//                                 <span className="letter">{cell.guess}</span>
//                             </div>))
//                     }
//                 </div>
//             </div>
//         </>

//     )
// }
