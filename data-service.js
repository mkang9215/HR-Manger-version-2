const Sequelize = require('sequelize');

var sequelize = new Sequelize('', '', '', {
    host: 'ec2-54-161-239-198.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    }
});

var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,    
    hireDate: Sequelize.STRING,    
    department: Sequelize.INTEGER
});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});

Department.hasMany(Employee, {foreignKey: 'department'});


module.exports.initialize = () => {    
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve();
        }).catch(() => {
            reject("Unable to sync the database");
        });        
    });
}

module.exports.getAllEmployees = () => {
    return new Promise((resolve, reject) => {
        Employee.findAll().then((data) => {
            data = data.map(value => value.dataValues);
            resolve(data);
        }).catch(() => {
            reject("No results returned");
        });
    });
}

module.exports.getEmployeesByStatus = (empStatus) => {
    return new Promise((resolve, reject) => { 
        Employee.findAll({ 
            where: {
                status: empStatus
            }
        }).then((data) => {
            data = data.map(value => value.dataValues);
            resolve(data);
        }).catch(() => {
            reject("No results returned");
        });
    });
}

module.exports.getEmployeesByDepartment = (empDepartment) => {
    return new Promise((resolve, reject) => {
        Employee.findAll({ 
            where: {
                department: empDepartment
            }
        }).then((data) => {
            data = data.map(value => value.dataValues);
            resolve(data);
        }).catch(() => {
            reject("No results returned");
        });
    });
}

module.exports.getEmployeesByManager = (manager) => {
    return new Promise((resolve, reject) => { 
        Employee.findAll({ 
            where: {
                employeeManagerNum: manager
            }
        }).then((data) => {
            data = data.map(value => value.dataValues);
            resolve(data);
        }).catch(() => {
            reject("No results returned");
        });
    });
}

module.exports.getEmployeeByNum = (num) => {
    return new Promise((resolve, reject) => { 
        Employee.findAll({ 
            where: {
                employeeNum: num
            }
        }).then((data) => {
            data = data.map(value => value.dataValues);
            resolve(data[0]);
        }).catch(() => {
            reject("No results returned");
        });
    });
}

module.exports.addEmployee = (employeeData) => {
    employeeData.isManager = (employeeData.isManager) ? true : false;
    for (var prop in employeeData) {
        if(employeeData[prop] == "") {
            employeeData[prop] = null;
        }
    }        
    return new Promise((resolve, reject) => {      
        Employee.create({
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            hireDate: employeeData.hireDate,
            department: employeeData.department
        }).then(() => {
            resolve();
        }).catch(() => {
            reject("Unable to create employee");
        });
    });
}

module.exports.updateEmployee = (employeeData) => {    
    employeeData.isManager = (employeeData.isManager) ? true : false;
    for (var prop in employeeData) {
        if(employeeData[prop] == "") {
            employeeData[prop] = null;
        }
    }
    return new Promise((resolve, reject) => {   
        Employee.update({
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            hireDate: employeeData.hireDate,
            department: employeeData.department
        }, { where: {
            employeeNum: employeeData.employeeNum
        }}).then(() => {
            resolve();
        }).catch(() => {
            reject("Unable to update employee");
        });
    });
}

module.exports.deleteEmployeeByNum = (empNum) => {
    return new Promise((resolve, reject) => { 
        Employee.destroy({ 
            where: {
                employeeNum: empNum
            }
        }).then(() => {
            resolve();
        }).catch(() => {
            reject("No results returned");
        });
    });
}




module.exports.getDepartments = () => {
    return new Promise((resolve, reject) => { 
        Department.findAll().then((data) => {
            data = data.map(value => value.dataValues);
            resolve(data);
        }).catch(() => {
            reject("No results returned");
        });
    });
}

module.exports.addDepartment = (departmentData) => {
    for (var prop in departmentData) {
        if(departmentData[prop] == "") {
            departmentData[prop] = null;
        }
    }
    return new Promise((resolve, reject) => {       
        Department.create({
            departmentName: departmentData.departmentName
        }).then(() => {
            resolve();
        }).catch(() => {
            reject("Unable to create department");
        });
    });
}

module.exports.updateDepartment = (departmentData) => {
    for (var prop in departmentData) {
        if(departmentData[prop] == "") {
            departmentData[prop] = null;
        }
    }
    return new Promise((resolve, reject) => {   
        Department.update({
            departmentName: departmentData.departmentName
        }, { where: {
            departmentId: departmentData.departmentId
        }}).then(() => {
            resolve();
        }).catch(() => {
            reject("Unable to update department");
        });
    });
}

module.exports.getDepartmentById = (id) => {
    return new Promise((resolve, reject) => { 
        Department.findAll({ 
            where: {
                departmentId: id
            }
        }).then((data) => {
            data = data.map(value => value.dataValues);
            resolve(data[0]);
        }).catch(() => {
            reject("No results returned");
        });
    });
}

module.exports.deleteDepartmentById = (id) => {
    return new Promise((resolve, reject) => { 
        Department.destroy({ 
            where: {
                departmentId: id
            }
        }).then(() => {
            resolve();
        }).catch(() => {
            reject("No results returned");
        });
    });
}