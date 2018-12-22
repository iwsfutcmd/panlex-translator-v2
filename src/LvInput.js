import React, { useState, useRef } from 'react';

import './LvInput.scss';

import TextField, { Input } from '@material/react-text-field';
import MenuSurface, { Corner } from '@material/react-menu-surface';
import List, { ListItem, ListItemText, ListItemMeta } from '@material/react-list';

import debounce from 'lodash/debounce';
import { query } from './api';
import LoadingIcon from './LoadingIcon';

const LvInput = (props) => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnchor = useRef(null);

  const itemClick = (id) => {
    setSearchText('');
    setMenuOpen(false);
    props.onNewRequest(id);
  }

  const getSuggestions = debounce((txt) => {
    if (txt) {
      setLoading(true);
      query('/suggest/langvar', { 'txt': txt, 'pref_trans_langvar': props.interfaceLangvar })
        .then((response) => {
          setLoading(false);
          if (response.suggest) {
            setSuggestions(response.suggest);
            setMenuOpen(true);
          } else {
            setSuggestions([]);
          }
        });
    }
  }, 500);

  const onChange = (event) => {
    setSearchText(event.target.value);
    getSuggestions(event.target.value);
  }

  return (
    <>
      <form
        onSubmit={e => { e.preventDefault(); itemClick(suggestions[0].id) }}
        ref={menuAnchor}
        className="mdc-menu-surface--anchor"
      >
        <TextField
          className="lv-search"
          label={props.label}
          trailingIcon={loading ? <LoadingIcon /> : <></>}
          dense
        >
          <Input
            value={searchText}
            onChange={onChange}
            autoCapitalize="none"
            type="text"
          />
        </TextField>
      </form>
      <MenuSurface
        open={menuOpen}
        anchorElement={menuAnchor.current}
        anchorCorner={Corner.BOTTOM_START}
        onClose={() => setMenuOpen(false)}
      >
        <List twoLine>
          {suggestions.map(s => (
            <ListItem key={s.id} onClick={e => itemClick(s.id)}>
              <ListItemText
                primaryText={s.trans[0].txt}
                secondaryText={s.trans.slice(1).map(tran => tran.txt).join(' — ') || " "}
              />
              <ListItemMeta meta={s.uid} />
            </ListItem>
          ))}
        </List>
      </MenuSurface>
    </>
  );
};

export default LvInput;