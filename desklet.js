

const Gio = imports.gi.Gio;
const St = imports.gi.St;
const Desklet = imports.ui.desklet;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;  
const GLib = imports.gi.GLib;
const Tweener = imports.ui.tweener;
const Util = imports.misc.util;
const Main = imports.ui.main;

const Tooltips = imports.ui.tooltips;
const PopupMenu = imports.ui.popupMenu;
const Cinnamon = imports.gi.Cinnamon;
const Settings = imports.ui.settings;

const Soup = imports.gi.Soup;

const UUID = "bbcwx@oak-wood.co.uk";
const DESKLET_DIR = imports.ui.deskletManager.deskletMeta[UUID].path;

imports.searchPath.push(DESKLET_DIR);
const xml = imports.marknote;

const _httpSession = new Soup.SessionAsync();
Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault());

// Set up some constants for layout and styling
const TEXT_SIZE = 14;
const CC_TEXT_SIZE = 24;
const LABEL_TEXT_SIZE = 11;
const LINK_TEXT_SIZE =8;
const REFRESH_ICON_SIZE=14;
const TABLE_ROW_SPACING=2;
const TABLE_COL_SPACING=5;
const TABLE_PADDING=5;
const CONTAINER_PADDING=12;
const ICON_HEIGHT = 40;
const ICON_WIDTH = 48;
const CC_ICON_HEIGHT =170;
const CC_ICON_WIDTH =200;
const BUTTON_PADDING=3;
const STYLE_POPUP_SEPARATOR_MENU_ITEM = 'popup-separator-menu-item';

function MyDesklet(metadata,desklet_id){
  this._init(metadata,desklet_id);
}

MyDesklet.prototype = {
  __proto__: Desklet.Desklet.prototype,
    

  _init: function(metadata,desklet_id){
    //############Variables###########
    this.desklet_id = desklet_id;
    this.daynames={Monday: _('Mon'),Tuesday: _('Tue'), Wednesday: _('Wed'), Thursday: _('Thu'), Friday: _('Fri'), Saturday: _('Sat'), Sunday: _('Sun')};
    this.fwicons=[];this.labels=[];this.max=[];this.min=[];this.windd=[];this.winds=[];this.tempn=[];this.eachday=[];this.wxtooltip=[];
    this.cc=[];this.days=[];
    this.icon_paths = DESKLET_DIR + '/icons/';
    this.metadata = metadata;
    this.update_id = null;
    this.proces=null;
    this.test=0;
    this.no=4; 
    this.creditlink='www.bbc.co.uk/weather';
    this.bbcicons = {
      'clear sky' : '0.png', //night
      'sunny' : '1.png',
      'partly cloudy' : '2.png',  //night
      'sunny intervals' : '3.png',
      'sand storm' : '4.png', // not confirmed
      'mist' : '5.png',
      'fog' : '6.png',
      'white cloud' : '7.png',
      'light cloud' : '7.png',
      'grey cloud' : '8.png',
      'thick cloud' : '8.png',
      // light rain shower night 9
      'light rain shower' : '10.png',
      'drizzle' : '11.png',
      'light rain' : '12.png',
      // heavy rain shower night 13
      'heavy rain shower' : '14.png',
      'heavy rain' : '15.png',
      // sleet shower night 16
      'sleet shower' : '17.png',
      'sleet' : '18.png',
      // 19, 20, 21 ???
      // light snow shower night 22
      'light snow shower' : '23.png',
      'light snow' : '24.png',
      // heavy snow shower night 25
      'heavy snow shower' : '26.png',
      'heavy snow' : '27.png',
      // thundery shower night 28
      'thundery shower' : '29.png',
      'thunder storm' : '30.png',
      'thunderstorm' : '30.png',
      'hazy' : '32.png', //not confirmed
    };
    
    this.icons = {
      'clear sky' : '33.PNG', //night
      'sunny' : '01.PNG',
      'partly cloudy' : '38.PNG',  //night
      'sunny intervals' : '04.PNG',
      'mist' : '11.PNG',
      'fog' : '11.PNG',
      'white cloud' : '07.PNG',
      'light cloud' : '07.PNG',
      'grey cloud' : '08.PNG',
      'thick cloud' : '08.PNG',
      'light rain shower' : '16.PNG',
      'drizzle' : '12.PNG',
      'light rain' : '12.PNG',
      'heavy rain shower' : '16.PNG',
      'heavy rain' : '13.PNG',
      'sleet shower' : '24.PNG',
      'sleet' : '25.PNG',     
      'light snow shower' : '21.PNG',
      'light snow' : '19.PNG',
      'heavy snow shower' : '23.PNG',
      'heavy snow' : '22.PNG',
      'thundery shower' : '17.PNG',
      'thunder storm' : '15.PNG',
      'thunderstorm' : '15.PNG',
      'hazy' : '32.PNG', //not confirmed
    };
    
    //################################

    try {
      Desklet.Desklet.prototype._init.call(this, metadata);
      //#########################binding configuration file################
      this.settings = new Settings.DeskletSettings(this, UUID, this.desklet_id);                    
      this.settings.bindProperty(Settings.BindingDirection.ONE_WAY,"stationID","stationID",this._refreshweathers,null);
      this.settings.bindProperty(Settings.BindingDirection.ONE_WAY,"units","units",this._refreshweathers,null);
      this.settings.bindProperty(Settings.BindingDirection.ONE_WAY,"wunits","wunits",this._refreshweathers,null);
      this.settings.bindProperty(Settings.BindingDirection.ONE_WAY,"transparency","transparency",this._refreshweathers,null);
      this.settings.bindProperty(Settings.BindingDirection.ONE_WAY,"textcolor","textcolor",this._refreshweathers,null);
      this.settings.bindProperty(Settings.BindingDirection.ONE_WAY,"bgcolor","bgcolor",this._refreshweathers,null);
      this.settings.bindProperty(Settings.BindingDirection.ONE_WAY,"zoom","zoom",this._refreshweathers,null);
      this.settings.bindProperty(Settings.BindingDirection.ONE_WAY,"border","border",this._refreshweathers,null);
      this.settings.bindProperty(Settings.BindingDirection.ONE_WAY,"bordercolor","bordercolor",this._refreshweathers,null);
      this.settings.bindProperty(Settings.BindingDirection.ONE_WAY,"layout","layout",this._refreshweathers,null);


      this.helpFile = DESKLET_DIR + "/README";  
      this._menu.addAction(_("Help"), Lang.bind(this, function() {
        Util.spawnCommandLine("xdg-open " + this.helpFile);
      }));
           
      this.proces=true;
    
      this._refreshweathers();
      
    }
    catch (e) {
      global.logError(e);
    }
    return true;
  },

  //##########################REFRESH#########################  
  
  style_change: function() {
    this.window.vertical = (this.layout==1) ? true : false;
    this.cwicon.height=CC_ICON_HEIGHT*this.zoom;this.cwicon.width=CC_ICON_WIDTH*this.zoom;
    this.weathertext.style= 'text-align : center; font-size:'+CC_TEXT_SIZE*this.zoom+'px';
    this.fwtable.style="spacing-rows: "+TABLE_ROW_SPACING*this.zoom+"px;spacing-columns: "+TABLE_COL_SPACING*this.zoom+"px;padding: "+TABLE_PADDING*this.zoom+"px;";
    this.cityname.style="text-align: center;font-size: "+TEXT_SIZE*this.zoom+"px" ;    
    this.ctemp_captions.style = 'text-align : right;font-size: '+TEXT_SIZE*this.zoom+"px";
    this.ctemp_values.style = 'text-align : left; font-size: '+TEXT_SIZE*this.zoom+"px";
    
    if (this.border) {
      this.window.style="border: 2px solid "+this.bordercolor+"; border-radius: 12px; background-color: "+(this.bgcolor.replace(")",","+this.transparency+")")).replace('rgb','rgba')+"; color: "+this.textcolor;
    }
    else {
      this.window.style="border-radius: 12px; background-color: "+(this.bgcolor.replace(")",","+this.transparency+")")).replace('rgb','rgba')+"; color: "+this.textcolor;
    }
    this._separatorArea.height=5*this.zoom;

    for(f=1;f<this.no;f++) {
      this.labels[f].style='text-align : center;font-size: '+TEXT_SIZE*this.zoom+"px";
      this.fwicons[f].height=ICON_HEIGHT*this.zoom;this.fwicons[f].width= ICON_WIDTH*this.zoom;
      this.max[f].style= 'text-align : center; font-size: '+TEXT_SIZE*this.zoom+"px";
      this.min[f].style= 'text-align : center; font-size: '+TEXT_SIZE*this.zoom+"px";
      this.winds[f].style= 'text-align : center; font-size: '+TEXT_SIZE*this.zoom+"px";
     this.windd[f].style= 'text-align : center; font-size: '+TEXT_SIZE*this.zoom+"px";
    }
    
    this.buttons.style="padding-top:"+BUTTON_PADDING*this.zoom+"px;padding-bottom:"+BUTTON_PADDING*this.zoom+"px";
    
    this.iconbutton.icon_size=REFRESH_ICON_SIZE*this.zoom;
    this.banner.style='font-size: '+LINK_TEXT_SIZE*this.zoom+"px; color: " + this.textcolor;
    this.bannerpre.style='font-size: '+LINK_TEXT_SIZE*this.zoom+"px; color: " + this.textcolor; 
    
    this.maxlabel.style = 'text-align : right;font-size: '+LABEL_TEXT_SIZE*this.zoom+"px";
    this.minlabel.style = 'text-align : right;font-size: '+LABEL_TEXT_SIZE*this.zoom+"px";
    this.windlabel.style = 'text-align : right;font-size: '+LABEL_TEXT_SIZE*this.zoom+"px";
    this.winddlabel.style = 'text-align : right;font-size: '+LABEL_TEXT_SIZE*this.zoom+"px";
    
    this.cweather.style='padding: ' + CONTAINER_PADDING*this.zoom+'px';
    if (this.layout==1) {
      // loose the top padding on container in vertical mode (too much space)
      this.container.style='padding: 0 ' + CONTAINER_PADDING*this.zoom+'px ' + CONTAINER_PADDING*this.zoom+'px ' + CONTAINER_PADDING*this.zoom+'px ' ;
    } else {
      this.container.style='padding: ' + CONTAINER_PADDING*this.zoom+'px';
    }
    
  },
  
  createwindow: function(){
    this.window=new St.BoxLayout({vertical: ((this.layout==1) ? true : false)});
    
    // container for link and refresh icon
    this.buttons=new St.BoxLayout({vertical: false,style: "padding-top:"+BUTTON_PADDING*this.zoom+"px;padding-bottom:"+BUTTON_PADDING*this.zoom+"px",x_align:2, y_align:2 });
    // refresh icon
    this.iconbutton=new St.Icon({ icon_name: 'view-refresh-symbolic',
      icon_size: REFRESH_ICON_SIZE*this.zoom+'',
      icon_type: St.IconType.SYMBOLIC,
      style: "padding: 0 0 0 3px;"
    });
    this.but=new St.Button(); // container for refresh icon
    
    // these will hold the data for the three day forecast
    this.labels=[]; this.fwicons=[];this.max=[]; this.min=[]; this.windd=[]; this.winds=[]; this.eachday=[];
    this._separatorArea = new St.DrawingArea({ style_class: STYLE_POPUP_SEPARATOR_MENU_ITEM });
    
    // current weather values
    this.humidity=new St.Label();
    this.pressure=new St.Label();
    this.windspeed=new St.Label();
    
    // container for current weather values
    this.ctemp_values = new St.BoxLayout({vertical: true, style : 'text-align : left; font-size: '+TEXT_SIZE*this.zoom+"px"});
    // container for current weather labels
    this.ctemp_captions = new St.BoxLayout({vertical: true,style : 'text-align : right'});
    // container for current weather
    this.ctemp = new St.BoxLayout({vertical: false,x_align: 2});
    
    // city and city container
    this.cityname=new St.Label({style: "text-align: center;font-size: "+TEXT_SIZE*this.zoom+"px" });
    this.city=new St.BoxLayout({vertical:true,style: "align: center;"});
    
    // container for right (horizontal) or lower (vertical) part of window
    this.container= new St.BoxLayout({vertical: true, x_align: St.Align.MIDDLE, style: "padding-left: 5px;"});//definire coloana dreapta
    // container for left (horizontal) or upper (vertical) part of window
    this.cweather = new St.BoxLayout({vertical: true}); //definire coloana stangz
    // current weather icon container
    this.cwicon = new St.Bin({height: (CC_ICON_HEIGHT*this.zoom), width: (CC_ICON_WIDTH*this.zoom)}); //icoana mare cu starea vremii
    // current weather text
    this.weathertext=new St.Label({style: 'text-align : center; font-size:'+CC_TEXT_SIZE*this.zoom+'px'}); //-textul cu starea vremii de sub ditamai icoana :)
    
    this.city.add_actor(this.cityname); 

    this.ctemp_captions.add_actor(new St.Label({text: _('Humidity: ')}));
    this.ctemp_captions.add_actor(new St.Label({text: _('Pressure: ')}));
    this.ctemp_captions.add_actor(new St.Label({text: _('Wind: ')}));
    this.ctemp_values.add_actor(this.humidity);
    this.ctemp_values.add_actor(this.pressure);
    this.ctemp_values.add_actor(this.windspeed);
    this.ctemp.add_actor(this.ctemp_captions); //-adauga coloana din stanga la informatii
    this.ctemp.add_actor(this.ctemp_values);  //adauga coloana din dreapta la informatii     
    
    // build table to hold three day forecast
    this.fwtable =new St.Table({style: "spacing-rows: "+TABLE_ROW_SPACING*this.zoom+"px;spacing-columns: "+TABLE_COL_SPACING*this.zoom+"px;padding: "+TABLE_PADDING*this.zoom+"px;"});
    this.maxlabel = new St.Label({text: _('Max:'), style: 'text-align : right;font-size: '+LABEL_TEXT_SIZE*this.zoom+"px"});
    this.minlabel = new St.Label({text: _('Min:'), style: 'text-align : right;font-size: '+LABEL_TEXT_SIZE*this.zoom+"px"})
    this.windlabel = new St.Label({text: _('Wind:'), style: 'text-align : right;font-size: '+LABEL_TEXT_SIZE*this.zoom+"px"})
    this.winddlabel = new St.Label({text: _('Dir:'), style: 'text-align : right;font-size: '+LABEL_TEXT_SIZE*this.zoom+"px"})
    this.fwtable.add(this.maxlabel,{row:2,col:0});
    this.fwtable.add(this.minlabel,{row:3,col:0});
    this.fwtable.add(this.windlabel,{row:4,col:0});
    this.fwtable.add(this.winddlabel,{row:5,col:0}); 
    for(f=1;f<this.no;f++) {
      this.labels[f]=new St.Button({label: '', style: 'color: ' + this.textcolor + ';text-align: center;font-size: '+TEXT_SIZE*this.zoom+"px" });
      this.fwicons[f]=new St.Button({height:ICON_HEIGHT*this.zoom, width: ICON_WIDTH*this.zoom});
      this.max[f]=new St.Label({style: 'text-align : center;font-size: '+TEXT_SIZE*this.zoom+"px"});
      this.min[f]=new St.Label({style: 'text-align : center;font-size: '+TEXT_SIZE*this.zoom+"px"});
      this.winds[f]=new St.Label({style: 'text-align : center;font-size: '+TEXT_SIZE*this.zoom+"px"});
      this.windd[f]=new St.Label({style: 'text-align : center;font-size: '+TEXT_SIZE*this.zoom+"px"});
      this.wxtooltip[f] = new Tooltips.Tooltip(this.fwicons[f]);
      
      this.fwtable.add(this.labels[f],{row:0,col:f});
      this.fwtable.add(this.fwicons[f],{row:1,col:f});
      this.fwtable.add(this.max[f],{row:2,col:f});
      this.fwtable.add(this.min[f],{row:3,col:f});
      this.fwtable.add(this.winds[f],{row:4,col:f});
      this.fwtable.add(this.windd[f],{row:5,col:f});
    }
    
    this.but.set_child(this.iconbutton);
    this.but.connect('clicked', Lang.bind(this, this._refreshweathers));
    // seems we have to use a button for bannerpre to get the vertical alignment :(
    this.bannerpre=new St.Button({label: _('Data from '), style: 'font-size: '+LINK_TEXT_SIZE*this.zoom+"px; color: " + this.textcolor + ";"});
    this.banner=new St.Button({label: this.creditlink, 
      style: 'font-size: '+LINK_TEXT_SIZE*this.zoom+"px; color: " + this.textcolor + ";",
      reactive: true,
      track_hover: true,
      style_class: 'bbcwx-link'});
    this.banner.connect('clicked', Lang.bind(this, function() {
        Util.spawnCommandLine("xdg-open http://" + this.creditlink + '/' + this.stationID);
      }));
    this.bannertooltip = new Tooltips.Tooltip(this.banner, _('Click to visit the BBC weather website'));
    this.refreshtooltip = new Tooltips.Tooltip(this.but, _('Refresh'));
    this.buttons.add_actor(this.bannerpre);
    this.buttons.add_actor(this.banner);
    this.buttons.add_actor(this.but);
    this.container.add_actor(this.ctemp);//-- adauga tabelul cu informatiile depsre vreme     
    this.container.add_actor(this._separatorArea);//--adauga separatorul
    this.container.add_actor(this.fwtable); //--adauga zii/iconite/temperaturi
    this.cweather.add_actor(this.city); //--adauga label cu orasul
    this.cweather.add_actor(this.cwicon); //--adauga icoana
    this.cweather.add_actor(this.weathertext); //-adauga textul
    this.container.add_actor(this.buttons); //adauga butonul de jos si probabil si un banner cu accuweather
    this.window.add_actor(this.cweather);
    this.window.add_actor(this.container);
    
  },
  
  _refreshweathers: function() {
    //global.log('Entering _refreshweathers');
    if (this.proces) {
      if(this.test!=this.no) {
        this.test=this.no;
        this.createwindow(); 
      }
      this.style_change();
      this.setContent(this.window);
      
      // process the three day forecast
      let a = this.getWeather('3dayforecast', function(weather) {
        if (weather) {
          this.days=this.load_days(weather);
        }  else {
          this.days['city']=_('No data available');
        }
        this.cityname.text=this.days['city'];
        for(f=1;f<this.no;f++)
        {
          this.labels[f].label=this.daynames[this.days[f]['day']];

          this.fwicons[f].set_child(this._getIconImage(this.days[f]['weathertext']));      
          this.wxtooltip[f].set_text(_(this.days[f]['weathertext']));
          this.max[f].text=this._formatTemerature(this.days[f]['maximum_temperature'], true);
          this.min[f].text=this._formatTemerature(this.days[f]['minimum_temperature'], true);
          this.winds[f].text=this._formatWindspeed(this.days[f]['wind_speed'], true);
          this.windd[f].text= this.days[f]['wind_direction'];
        }
      });

      // process current observations
      let b = this.getWeather('observations', function(weather) {
        if (weather) {
          this.cc=this.set_vars(weather); 
        } else {
          this.cc['weathertext']=_('No data available');
        }
        this.cwicon.set_child(this._getIconImage(this.cc['weathertext'])); //--refresh
        this.weathertext.text=_(this.cc['weathertext']) + ', ' + this._formatTemerature(this.cc['temperature'], true);
        this.humidity.text= this.cc['humidity'];
        this.pressure.text=this.cc['pressure'];
        this.windspeed.text=this.cc['wind_direction']+ ", " + this._formatWindspeed(this.cc['wind_speed'], true);
      });
    
      this._timeoutId=Mainloop.timeout_add_seconds(600 + Math.round(Math.random()*120), Lang.bind(this, this._refreshweathers));
    }
  },
    
  _getIconImage: function(wxtext) {
    var icon_name = 'DUNNO.PNG';
    wxtext = wxtext.toLowerCase();
    //global.log('wxtext: ' + wxtext);
    if (typeof this.icons[wxtext] !== "undefined") {
      icon_name = this.icons[wxtext];
    }
      
    let icon_file = this.icon_paths + icon_name;
    let file = Gio.file_new_for_path(icon_file);
    let icon_uri = file.get_uri();

    return St.TextureCache.get_default().load_uri_async(icon_uri, 200*this.zoom, 200*this.zoom);
  },
  
  // take a string with both C and F and extract the required 
  // value. Append unit string if units is true
  _formatTemerature: function(temp, units) {
    units = typeof units !== 'undefined' ? units : false;
    if (!temp) return '';
    var celsius = temp.slice(0, temp.indexOf('C')-1).trim();
    var fahr = temp.slice(temp.indexOf('(')+1, temp.length - 3).trim();
    var out = ((this.units==1) ? celsius : fahr);
    if (units) {
      out += ((this.units==1) ? _("\u2103") : _("\u2109"))
    }
    return out;
  },

  // take a string with speed in mph and convert to required 
  // units. Append unit string if units is true
  _formatWindspeed: function(wind, units) {
    units = typeof units !== 'undefined' ? units : false;
    if (!wind) return '';
    var conversion = {
      'mph': 1,
      'knots': 0.869,
      'kph': 1.6,
      'mps': 0.447
    };
    var unitstring = {
      'mph': _('mph'),
      'knots': _('kts'),
      'kph': _('km/h'),
      'mps': _('m/s')
    }
    var mph = wind.replace('mph', '');
    var out = mph * conversion[this.wunits];
    out = out.toFixed(0);
    if (units) {
      out += unitstring[this.wunits];
    }
    return out;
  },
    
  // take an rss feed of current observations and extract data into an array
  set_vars: function (rss) {
    var parser = new marknote.Parser();
    var doc = parser.parse(rss);
    var rootElem = doc.getRootElement();
    var channel = rootElem.getChildElement("channel");
    var item = channel.getChildElement("item");
    var desc = item.getChildElement("description").getText();
    var title = item.getChildElement("title").getText();
    desc = desc.replace('mb,', 'mb|');
    parts
    var cc=[];
    cc['weathertext'] = title.split(':')[2].split(',')[0].trim();
    var parts = desc.split(',');
    var k, v;
    for (var b=0; b<parts.length; b++) {
      k = parts[b].slice(0, parts[b].indexOf(':')).trim().replace(' ', '_').toLowerCase();
      v = parts[b].slice(parts[b].indexOf(':')+1).trim();
      if (k == "wind_direction") {
        var vparts = v.split(" ");
        v = '';
        for (var c=0; c<vparts.length; c++) {
          v += vparts[c].charAt(0).toUpperCase();
        }
      }
      if (k == "pressure") {
        v=v.replace('|', ',');
      }      
      cc[k] = v;
    }   
    
    return cc;
  },
  
  // take an rss feed of 3 day forecast and extract data into an array
  load_days: function (rss) {
    //global.log('entering load_days');
    var days = [];
    
    var parser = new marknote.Parser();
    var doc = parser.parse(rss);

    var rootElem = doc.getRootElement();
    var channel = rootElem.getChildElement("channel");
    days['city'] = channel.getChildElement("title").getText().split("Forecast for")[1].trim();
    //global.log('City: ' + days['city']);
    var items = channel.getChildElements("item");
    var desc, title;

    var data = [];
    for (var i=0; i<items.length; i++) {
      desc = items[i].getChildElement("description").getText();
      title = items[i].getChildElement("title").getText();
      data['link'] = items[i].getChildElement("link").getText();
      //global.log('Link: ' + data['link']);
      data['day'] = title.split(':')[0].trim();
      data['weathertext'] = title.split(':')[1].split(',')[0].trim();
      var parts = desc.split(',');
      var k, v;
      for (var b=0; b<parts.length; b++) {
        k = parts[b].slice(0, parts[b].indexOf(':')).trim().replace(' ', '_').toLowerCase();
        v = parts[b].slice(parts[b].indexOf(':')+1).trim();
        if (k == "wind_direction") {
          var vparts = v.split(" ");
          v = '';
          for (var c=0; c<vparts.length; c++) {
            v += vparts[c].charAt(0).toUpperCase();
          }
        }
        data[k] = v;
      }
      days[i+1] = data;
      data = [];
    }
    global.log('returning from load_days');
    return days;
  },
  
  // async call to retrieve rss feed. 
  // -> type: either '3dayforecast' or 'observations'
  getWeather: function(type, callback) {
    global.log("Called getWeather with type " + type);
    let here = this;
    let url = 'http://open.live.bbc.co.uk/weather/feeds/en/' + this.stationID +'/' + type + '.rss';
    let message = Soup.Message.new('GET', url);
    _httpSession.queue_message(message, function (session, message) {
      if( message.status_code == 200) {
        let mes = message.response_body.data;
        callback.call(here,mes.toString()); 
      } else {
        global.log("Error retrieving address " + url + ". Status: " + message.status_code);
        callback.call(here,false);
      }
    });
  }, 

  
  on_desklet_removed: function() {
    if(this._timeoutId)
    {Mainloop.source_remove(this._timeoutId);}
  }
}

function main(metadata, desklet_id){
  let desklet = new MyDesklet(metadata,desklet_id);
  return desklet;
}
