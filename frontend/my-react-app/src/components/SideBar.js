import React from "react";
import {NavLink, useLocation } from "react-router-dom";

export default function SideBar({ isCollapsed }){
    const location = useLocation();
    return <>
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="logo">
            <div className="logo-img">
                <img className="img" src="https://as1.ftcdn.net/v2/jpg/08/22/28/66/1000_F_822286634_JqfHuMV7aEWpjIP3x23GPwzz2Blcd5Wg.jpg" />
                {!isCollapsed && <span>Super Admin</span>}
            </div>
        </div>
        <div className="content">
            <ul className="menu">
                <li className="menu-item">
                    <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'Link')} to={'/dashboard'}>
                <span><i class="fa-solid fa-home"></i></span>
                {!isCollapsed && <span>Home</span>} 
                    </NavLink>
                </li>
                <li className="menu-item">
              <NavLink 
                className={({ isActive }) => (isActive ? 'active-link' : 'Link')} 
                to="/template-list"
              >
                <span><i className="fa-solid fa-file"></i></span>
                {!isCollapsed && <span>Template List</span>} {/* Link to Template List */}
              </NavLink>
            </li>                
                <li className="menu-item">
                    <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'Link')} to={'/task-report'}>
                <span><i class="fa-solid fa-users-rectangle"></i></span>
                {!isCollapsed && <span>Testing Report</span>}
                    </NavLink>
                </li>
                <li className="menu-item">
                    <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'Link')} to={'/bug-report'}>
                <span><i class="fa-solid fa-users-rectangle"></i></span>
                {!isCollapsed && <span>Assigned Bug</span>}
                    </NavLink>
                </li>
            </ul>
        </div>
    </div>
    
   
   
    
    </>
}
