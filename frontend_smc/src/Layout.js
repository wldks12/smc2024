import React from 'react';
import Header from './Header';
import Nav from './Nav';

function Layout({ children }) {
    return (
        <>
            <Header />
            <Nav />
            <main style={{ padding: "20px" }}>{children}</main>
        </>
    );
}

export default Layout;
