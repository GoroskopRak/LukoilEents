import React, { FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
// import  './styles.scss'
import { useAppDispatch } from '../../app/hooks';
import { fetchLoginAppBasic } from '../../services/login/loginSlice';
import { fetchDraftSupplyPointEvent } from '../../services/pointEvents/pointEventsSlice';
import { useGetDraftSupplyPointEvents } from '../../hooks/pointEventsHook';
import Header from '../../components/Header/header';
import  './styles.scss'

export const PointEventsPage = () => {
    const {allPointEvents} = useGetDraftSupplyPointEvents({})
console.log(allPointEvents)
   
	return (
		<div className='event-page-container'>
            <Header/>
			<h2>События</h2>
			<div className='flex-between'><button>фильтр</button><button>Создать событие</button></div>

			<table>
						<thead data-tpl="head">
							<tr>
								<td data-field="IsAccepted">Статус</td>
								<td data-field="BeginDate">Дата начала</td>

								<td data-field="BeginDate">Тип</td>
								<td data-field="BeginDate">Объект</td>
								<td data-field="BeginDate">Точка</td>
								
								<td data-field="Value">График</td>
								<td data-field="Value">Действия</td>
							</tr>
						</thead>
						<tbody>
							{allPointEvents && allPointEvents?.map((point) => (
								<tr data-tpl="row" className="level1">
								<td data-field="IsAccepted">
									<input type='checkbox' checked={point?.IsAccepted}/>
									</td>
								<td data-field="BeginDate">{point?.BeginDate}</td>
								<td data-field="Value">3.2</td>
							</tr>
							))}
						</tbody>
						
					</table>
			
			{/* {allPointEvents.toString()} */}
		</div>
	)
}

export default PointEventsPage
