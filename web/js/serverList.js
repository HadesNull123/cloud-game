/**
 * Server list module.
 * @version 1
 */
const serverList = (() => {
    const id = 'server-list',
        root = document.getElementById(id),
        index = ((i = 1) => () => i++)(),
        // cap -- is a caption of the field
        // mut -- ia a transformation function for the field value
        list = {
            'n': {
                // print line number as 01
                mut: (_) => String(index()).padStart(2, '0')
            },
            'id': {cap: 'ID'},
            'addr': {
                cap: 'Address',
                mut: (v) => {
                    try {
                        return new URL(v).host
                    } catch (_) {
                        return v
                    }
                }
            },
            'is_busy': {cap: 'State', mut: (v) => v === true ? 'X' : ''},
            'use': {mut: (_) => '>>'}
        },
        fields = Object.keys(list);

    // root.classList.add("hidden");

    const state = {
        servers: [],
        shown: true,
    }

    // waiting for the server connection when it's ready
    const onReady = () => socket.getServerList()

    const handleGetServerList = (data) => {
        state.servers = data?.servers ? data.servers : [];
        _render();
    }

    function _render() {
        if (!state.shown) {
            gui.hide(root);
            return;
        }
        root.innerHTML = '';
        gui.show(root);

        if (state.servers.length === 0) {
            root.append(gui.create('span', (el) => el.innerText = 'No data :('));
            return;
        }

        const frag = gui.fragment();
        const header = gui.create('div', (el) => {
            el.classList.add(`${id}__header`);
            fields.forEach(field => el.append(gui.create('span', (f) => f.innerHTML = list[field]?.cap || '')))
        });
        frag.appendChild(header)

        const renderRow = (server) => (row) => fields.forEach(field => {
            const val = server.hasOwnProperty(field) ? server[field] : '';
            const mut = list[field]?.mut;
            row.appendChild(gui.create('span', (f) => f.innerHTML = mut ? mut(val) : val));
        })
        state.servers.forEach(server => frag.appendChild(gui.create('div', renderRow(server))))
        root.appendChild(frag);
    }

    event.sub(SOCKET_READY, onReady);
    event.sub(GET_SERVER_LIST, handleGetServerList);

    return {}
})(document, event, gui, log, socket);
