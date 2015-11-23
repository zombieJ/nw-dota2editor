# Dota2 KV Editor - not finished yet
Dota2 KV Editor is a easy tool for dota2 developer to edit KV ability & multi language support description with Visualization.
【Dota2 KV编辑器 是一款可以可视化编辑KV技能及其多语言描述的编辑器】

已经完成：
新建、复制、删除技能/物品
修改技能、修饰器名称会自动改动多语言描述字段
智能读取游戏技能/物品图标 和 自定义图标
只会保存修改的技能
不需要手写precache，会自动填入
声音文件自动匹配名称
技能/物品可以标记颜色，排序
智能检测冲突的技能名称
文字描述调色盘
如果没有勾选行为，将隐藏对应的属性
物品自动分配id
简易的技能模板
树状结构快速导航
如果修饰器被设为隐藏，则多语言界面显示隐藏标记
语言界面显示所有使用到的语言
检测是否存在未填写描述的技能和修饰器

### TODO list
* OnAttackStart
* Modifier attribute support multi-attr
* Search able of modifier attrs/states
* XavierCHN：基类 模型 生命值 貌似就这三个是必定必须要有的
* ability special adjust
* DeleteOnHit 1
* Empty operation not save
* link each other
* item compound formula auto generate
* sound finder
* Auto generate english language version
* Auto create empty modifier
* Cache icons
* unit edit provide ability tips
* Custom sound support:http://www.dota2rpg.com/thread-2491-1-1.html
* fast search ability
* ability_lua & RunScript auto generate lua file
* Ability icon picker
* Create new file if file not exist
* Version control
* SpellLibrary as template
* Tree view of customize skill group
* Win10 smartScreen will block program
* Auto detect file change to reload in UI
