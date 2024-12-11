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
                    <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'Link')} to={'/employee-list'}>
                <span><i class="fa-solid fa-user-tie"></i></span>
                {!isCollapsed && <span>Employee List</span>} 
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
                {!isCollapsed && <span>Assigned Bugs</span>}
                    </NavLink>
                </li>
                <li className="menu-item">
                    <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'Link')} to={'/client-list'}>
                <span><i class="fa-solid fa-users-rectangle"></i></span>
                {!isCollapsed && <span>Client list</span>}
                    </NavLink>
                </li>
                <li className="menu-item">
                    <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'Link')} to={'/template-admins'}>
                <span><i class="fa-solid fa-user-pen"></i></span>
                {!isCollapsed && <span>Template Admin</span>}
                    </NavLink>
                </li>
                <li className="menu-item">
                <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'Link')} to={'/hosted-list'}>
                <span><i class="fa-solid fa-globe"></i></span>
                {!isCollapsed && <span>Hosted Sites</span>}
                    </NavLink>
                </li> 
                 <li className="menu-item">
                 <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'Link')} to={'/approvals'}>
                <span><i class="fa-solid fa-folder"></i></span>
                {!isCollapsed && <span>Template Approvals</span>}
                    </NavLink>
                </li>
            </ul>
        </div>
    </div>
    
   
   
    
    </>
}
